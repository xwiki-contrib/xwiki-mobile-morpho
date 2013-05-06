//  Created by Jesse MacFadyen on 10-05-29.
//  Copyright 2010 Nitobi. All rights reserved.
//  Copyright 2012, Randy McMillan

#import <Cordova/CDVPlugin.h>
#import "PageBrowserViewController.h"

@interface PageBrowserCommand : CDVPlugin <PageBrowserDelegate>{}

@property (nonatomic, strong) PageBrowserViewController* pageBrowser;

- (void)showWebPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)showHTML:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)setHTML:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)showSideMenu:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)hideSideMenu:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)realClose;
- (void)updateFrameSize:(CGFloat)withSideMenu;
- (void)onChildLocationChange:(NSString*)newLoc;
- (void)onChildBeforeLocationChange:(NSString*)newLoc;
- (void)onChildShouldLocationChange:(NSString*)newLoc;

@end
