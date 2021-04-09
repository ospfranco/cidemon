import Foundation
import KeychainAccess
import ServiceManagement
import StoreKit
import LaunchAtLogin

extension Notification.Name {
    static let killLauncher = Notification.Name("killLauncher")
}

private let keychain = Keychain(service: "Tempomat Keychain")

@objc(CIDemonNative)
class CIDemonNative: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func setStatusButtonText(_ failed: NSInteger, running: NSInteger, passed: NSInteger) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.setStatusText(failed: failed, running: running, passed: passed)
    }
  }

  @objc
  func securelyStore(_ key: NSString, payload: NSString, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    keychain[key as String] = payload as String
    resolver(true)
  }

  @objc
  func securelyRetrieve(_ key: NSString, resolver resolve: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    let value = keychain[key as String]
    return resolve(value)
  }

  @objc
  func sendNotification(_ title: NSString, payload: NSString, url: NSString) {
    let notification = NSUserNotification()
    notification.identifier = UUID().uuidString
    notification.subtitle = payload as String
    notification.title = title as String
    notification.userInfo = [
      "url": url
    ]
    notification.soundName = "default"

    NSUserNotificationCenter.default.deliver(notification)
  }

  @objc
  func applyAutoLauncher(_ startAtLogin: Bool) {
    LaunchAtLogin.isEnabled = startAtLogin
  }

  @objc
  func closeApp() {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.closeApp()
    }
  }

  @objc
  func requestReview() {
    SKStoreReviewController.requestReview()
  }
}
