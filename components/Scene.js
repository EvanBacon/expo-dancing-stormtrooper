import Expo from 'expo';
import React from 'react';
import ExpoTHREE from 'expo-three';
import ThreeView from '../ThreeView';
import Touches from '../window/Touches';
import Files from '../Files';
import Audio from '../Audio';

const alignMesh = (mesh, axis = { x: 0.5, y: 0.5, z: 0.5 }) => {
  axis = axis || {};
  const box = new THREE.Box3().setFromObject(mesh);

  const size = box.getSize();
  const min = { x: -box.min.x, y: -box.min.y, z: -box.min.z };

  Object.keys(axis).map(key => {
    const scale = axis[key];
    mesh.position[key] = min[key] - size[key] + size[key] * scale;
  });
};
const scaleLongestSideToSize = (mesh, size) => {
  const { x: width, y: height, z: depth } = new THREE.Box3()
    .setFromObject(mesh)
    .getSize();
  const longest = Math.max(width, Math.max(height, depth));
  const scale = size / longest;
  mesh.scale.set(scale, scale, scale);
};

const AR = true;

class Scene extends React.Component {
  shouldComponentUpdate = () => false;

  async componentDidMount() {
    Expo.Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Expo.Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Expo.Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });

    await this.playBackgroundMusicAsync();
  }
  playBackgroundMusicAsync = async () => {
    const { sound: cantina } = await Expo.Audio.Sound.create(Audio.cantina);

    await cantina.setStatusAsync({
      shouldPlay: true,
      isLooping: true,
      volume: 1,
    });
  };

  render = () => (
    <ThreeView
      style={{ flex: 1 }}
      onContextCreate={this._onContextCreate}
      render={this._animate}
      enableAR={AR}
    />
  );

  _onContextCreate = async (gl, arSession) => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x339ce2);
    // Set max vertex uniforms to allow for more bones. If your mesh doesn't appear to bind to the skeleton then this value isn't high enough
    this.renderer.capabilities.maxVertexUniforms = 52502;
    // scene
    this.scene = new THREE.Scene();
    // camera

    if (AR) {
      // AR Background Texture
      this.scene.background = ExpoTHREE.createARBackgroundTexture(
        arSession,
        this.renderer
      );

      /// AR Camera
      this.camera = ExpoTHREE.createARCamera(
        arSession,
        width,
        height,
        0.01,
        1000
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(25, width / height, 1, 10000);
      this.camera.position.set(15, 10, -15);
      this.camera.lookAt(new THREE.Vector3());

      this.controls = new THREE.OrbitControls(this.camera);
      this.controls.update();
      // custom scene
    }
    await this.setupSceneAsync();

    // resize listener
    window.addEventListener('resize', this._onWindowResize, false);

    this.finishLoadingScene();
  };

  finishLoadingScene = () => {
    this.props.onFinishedLoading();
  };

  setupSceneAsync = async () => {
    // this.scene.add(new THREE.GridHelper(10, 20));
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    await this.setupColladaSceneAsync();
  };

  loadRawFileAsync = async localUri => {
    console.log('Load local file', localUri);
    try {
      const file = await Expo.FileSystem.readAsStringAsync(localUri);
      return file;
    } catch (error) {
      console.log('Error from loadRawFileAsync');
      console.error(error);
    }
  };

  /* 
           THREE.ColladaModel
           
           animations: any[];
           kinematics: any;
           scene: Scene;
           library: any;
    */
  loadColladaAsync = async staticResource => {
    //Load Asset
    const asset = Expo.Asset.fromModule(staticResource);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    const loader = new THREE.ColladaLoader();

    // const file = await this.loadRawFileAsync(asset.localUri);
    // Cheever method (Dire Dire Ducks)
    // const collada = loader.parse(file);

    // Alt Method: has onLoad function. Error signature may be different (less useful) than loading directly from FileSystem
    const collada = await new Promise((res, rej) =>
      loader.load(asset.localUri, res, this.props.onLoadingUpdated, rej)
    );

    return collada;
  };

  setupColladaSceneAsync = async () => {
    const collada = await this.loadColladaAsync(Files.stormtrooper.model);

    const { animations, kinematics, scene } = collada;
    this.kinematics = kinematics;

    alignMesh(scene, { y: 0, z: -0.3 });
    scaleLongestSideToSize(scene, 0.5);
    scene.rotation.z = Math.PI;
    scene.updateMatrix();

    /* 
            Build a control to manage the animations
            This breaks if the model doesn't have animations - this needs to be fixed as it's probably 80% of free models
        */
    this.mixer = new THREE.AnimationMixer(scene);

    /*
            play the first animation.
            return a reference for further control.
            A more expo-esque function signature would be playAnimationAsync();
        */
    this.mixer.clipAction(animations[0]).play();

    this.scene.add(scene);

    /*
            This will help visualize the animation
        */
    // this.setupSkeletonHelperForScene(scene);
  };

  setupSkeletonHelperForScene = scene => {
    const helper = new THREE.SkeletonHelper(scene);
    helper.material.linewidth = 3;
    this.scene.add(helper);
  };

  _onWindowResize = () => {
    const {
      innerWidth: width,
      innerHeight: height,
      devicePixelRatio: scale,
    } = window;

    // On Orientation Change, or split screen on android.
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update Renderer
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  _animate = delta => {
    if (this.mixer !== undefined) {
      this.mixer.update(delta); //returns THREE.AnimationMixer
    }
    this._render();
  };

  _render = () => {
    // Render Scene!
    this.renderer.render(this.scene, this.camera);
  };
}

// Wrap Touches Event Listener
export default Touches(Scene);
