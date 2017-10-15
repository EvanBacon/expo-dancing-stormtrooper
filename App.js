import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text } from 'react-native';
import Scene from './components/Scene';
import cacheAssetsAsync from './util/cacheAssetsAsync';
import arrayFromObject from './util/arrayFromObject';
import GithubButton from './components/GithubButton';

import './Three';
import './window/domElement';
import './window/resize';
import './THREETextureLoader';

import Files from './Files';
import Audio from './Audio';

export default class AppContainer extends Component {
  state = { loading: true, sceneLoaded: false };
  async componentDidMount() {
    this.loadAssetsAsync();
  }

  loadAssetsAsync = async () => {
    try {
      await cacheAssetsAsync({
        files: arrayFromObject(Files).concat(arrayFromObject(Audio)),
      });
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: app.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Patience Young Padawan...</Text>
    </View>
  )
  render() {
    if (this.state.loading) {
      return this.renderLoadingScreen();
    }
    return (
      <View style={styles.container}>
        <Scene 
        onLoadingUpdated={(xhr) => {
          console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        }}
        onFinishedLoading={() => {
          this.setState({sceneLoaded: true})
        }}/>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
        <GithubButton />
        {!this.state.sceneLoaded && this.renderLoadingScreen() }
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'
  },
  loadingText: {
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
