import Expo from 'expo';

// import { RGBAFormat, RGBFormat } from 'three/src/constants';
// import { Texture } from 'three/src/textures/Texture';
// import { DefaultLoadingManager } from 'three/src/loaders/LoadingManager';
import { ImageLoader } from 'three/src/loaders/ImageLoader';
import THREE from './Three';
import Files from './Files';
// hack :(
THREE.TextureLoader.prototype.load = function(
  url,
  onLoad,
  onProgress,
  onError
) {
  var loader = new ImageLoader(this.manager);
  loader.setCrossOrigin(this.crossOrigin);
  loader.setPath(this.path);

  const texture = new THREE.Texture();
  texture.minFilter = THREE.LinearFilter; // Pass-through non-power-of-two

  (async () => {
    const asset = Expo.Asset.fromModule(Files.stormtrooper.diffuse);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    texture.image = {
      data: asset,
      width: asset.width,
      height: asset.height,
    };
    texture.needsUpdate = true;
    texture.isDataTexture = true; // Forces passing to `gl.texImage2D(...)` verbatim

    if (onLoad !== undefined) {
      onLoad(texture);
    }
  })();

  return texture;
};
