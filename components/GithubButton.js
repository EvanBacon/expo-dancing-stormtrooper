import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Linking, StyleSheet } from 'react-native';

const url = "https://github.com/EvanBacon/expo-dancing-stormtrooper"
export default class GithubButton extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.touchable} onPress={() => Linking.canOpenURL(url).then(supported => {
        if (!supported) {
          console.log('Can\'t handle url: ' + url);
        } else {
          return Linking.openURL(url);
        }
      }).catch(err => console.error('An error occurred', err))}>
      <View style={styles.container}>
        <Text style={styles.paragraph}>Code</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
    touchable: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    opacity: 0.3,
    borderRadius: 4    
  },
  paragraph: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
