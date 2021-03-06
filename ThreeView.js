import Expo from 'expo';
import React from 'react';
import { findNodeHandle, NativeModules, View, Text } from 'react-native';
import PropTypes from 'prop-types'; // 15.6.0
import 'three'; // 0.87.1
export default class ThreeView extends React.Component {
  static propTypes = {
    style: View.propTypes.style,
    onContextCreate: PropTypes.func.isRequired,
    render: PropTypes.func.isRequired,
    enableAR: PropTypes.bool,
  };
  render = () => {
    if (!Expo.Constants.isDevice) {
      return (
        <View
          style={{
            backgroundColor: 'red',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Can't Run GLView in Simulator :(</Text>
        </View>
      );
    }

    return (
      <Expo.GLView
        nativeRef_EXPERIMENTAL={this._setNativeGLView}
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    );
  };

  _setNativeGLView = ref => {
    this._nativeGLView = ref;
  };

  _onGLContextCreate = async gl => {
    // Stubbed out methods for shadow rendering
    gl.createRenderbuffer = () => {};
    gl.bindRenderbuffer = () => {};
    gl.renderbufferStorage = () => {};
    gl.framebufferRenderbuffer = () => {};

    let arSession;
    if (this.props.enableAR) {
      // Start AR session
      arSession = await NativeModules.ExponentGLViewManager.startARSession(
        findNodeHandle(this._nativeGLView)
      );
    }

    await this.props.onContextCreate(gl, arSession);
    let lastFrameTime;
    const render = () => {
      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;
      requestAnimationFrame(render);

      this.props.render(dt);
      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      gl.endFrameEXP();

      lastFrameTime = now;
    };
    render();
  };
}
