import {NativeModules} from 'react-native';

interface CIDemonNative {
  requestReview: () => void;
  sendNotification: (title: string, payload: string, url: string) => void;
  securelyStore: (key: string, value: string) => void;
  securelyRetrieve: (key: string) => string | null;
  applyAutoLauncher: (autoLauncherValue: boolean) => void;
  closeApp: () => void;
  showShareMenu: (x: number, y: number, text: string) => void;
}

function createCIDemonNative(nativeModule: any): CIDemonNative {
  return {
    requestReview: nativeModule.requestReview,
    sendNotification: __DEV__ ? () => null : nativeModule.sendNotification,
    securelyStore: nativeModule.securelyStore,
    securelyRetrieve: nativeModule.securelyRetrieve,
    applyAutoLauncher: nativeModule.applyAutoLauncher,
    closeApp: nativeModule.closeApp,
    showShareMenu: nativeModule.showShareMenu
  };
}

export const cidemonNative = createCIDemonNative(NativeModules.CIDemonNative);