//Author: Oscar Franco, created on: 04.07.20

import Foundation

class ReactNativeBridge {
    let bridge: RCTBridge

    init() {
        bridge = RCTBridge(delegate: ReactNativeBridgeDelegate(), launchOptions: nil)
    }
}

class ReactNativeBridgeDelegate: NSObject, RCTBridgeDelegate {

    func sourceURL(for bridge: RCTBridge!) -> URL! {
        let jsCodeLocation: URL

        #if DEBUG
          jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
        #else
          jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
        #endif
        return jsCodeLocation
    }
}
