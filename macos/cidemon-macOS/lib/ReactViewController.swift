//Author: Oscar Franco, created on: 04.07.20

import Foundation

class ReactViewController: NSViewController {
  init(moduleName: String, bridge: RCTBridge) {
    super.init(nibName: nil, bundle: nil)

    view = RCTRootView(bridge: bridge, moduleName: moduleName, initialProperties: nil)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}
