//Author: Oscar Franco, created on: 25.05.20

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(CIDemonNative, NSObject)

RCT_EXTERN_METHOD(setStatusButtonText: (NSInteger)failed running:(NSInteger)running passed:(NSInteger)passed)

RCT_EXTERN_METHOD(securelyStore: (NSString)key payload:(NSString)payload resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(securelyRetrieve: (NSString)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendNotification: (NSString)title payload:(NSString)payload url:(NSString)url)

RCT_EXTERN_METHOD(applyAutoLauncher: (BOOL)startAtLogin)

RCT_EXTERN_METHOD(closeApp)

RCT_EXTERN_METHOD(requestReview)

// RCT_EXTERN_METHOD(checkForUpdates)

@end
