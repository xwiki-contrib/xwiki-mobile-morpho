//  Created by Jesse MacFadyen on 10-05-29.
//  Copyright 2010 Nitobi. All rights reserved.
//  Copyright 2012, Randy McMillan

#import "PageBrowserCommand.h"
#import <Cordova/CDVViewController.h>
#import <AVFoundation/AVFoundation.h>

@implementation PageBrowserCommand

@synthesize pageBrowser;

- (void)showWebPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  // args: url
{
    /* setting audio session category to "Playback" (since iOS 6) */
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSError *setCategoryError = nil;
    BOOL ok = [audioSession setCategory:AVAudioSessionCategoryPlayback error:&setCategoryError];
    if (!ok) {
        NSLog(@"Error setting AVAudioSessionCategoryPlayback: %@", setCategoryError);
    };

    if (self.pageBrowser == nil) {
#if __has_feature(objc_arc)
        self.pageBrowser = [[PageBrowserViewController alloc] initWithScale:NO];
#else
        self.pageBrowser = [[[PageBrowserViewController alloc] initWithScale:NO] autorelease];
#endif
        self.pageBrowser.delegate = self;
        self.pageBrowser.orientationDelegate = self.viewController;
    }

    /* // TODO: Work in progress
     NSString* strOrientations = [ options objectForKey:@"supportedOrientations"];
     NSArray* supportedOrientations = [strOrientations componentsSeparatedByString:@","];
     */

    [self.viewController presentViewController:pageBrowser animated:YES completion:NULL];

    NSString* url = (NSString*)[arguments objectAtIndex:0];

    [self.pageBrowser loadURL:url];
}

- (void)showHTML:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  // args: url
{
    /* setting audio session category to "Playback" (since iOS 6) */
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSError *setCategoryError = nil;
    BOOL ok = [audioSession setCategory:AVAudioSessionCategoryPlayback error:&setCategoryError];
    if (!ok) {
        NSLog(@"Error setting AVAudioSessionCategoryPlayback: %@", setCategoryError);
    };
    
    if (self.pageBrowser == nil) {
#if __has_feature(objc_arc)
        self.pageBrowser = [[PageBrowserViewController alloc] initWithScale:NO];
#else
        self.pageBrowser = [[[PageBrowserViewController alloc] initWithScale:NO] autorelease];
#endif
        self.pageBrowser.delegate = self;
        self.pageBrowser.orientationDelegate = self.viewController;
    }
    
    /* // TODO: Work in progress
     NSString* strOrientations = [ options objectForKey:@"supportedOrientations"];
     NSArray* supportedOrientations = [strOrientations componentsSeparatedByString:@","];
     */
    
    // make sure the view port is the right size
    [self updateFrameSize:FALSE];

    // [self.viewController presentViewController:PageBrowser animated:YES  completion:NULL];
    // make a normal sub view so that it does not take all screen
    [self.viewController.view addSubview:self.pageBrowser.view];
    
    NSString* html = (NSString*)[arguments objectAtIndex:0];
    
    [self.pageBrowser loadHTML:html];
}


- (void)setHTML:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  // args: url
{
    NSString* html = (NSString*)[arguments objectAtIndex:0];
    // NSLog(@"Opening HTML : %@", html);
    [self.pageBrowser loadHTML:html];
}


- (void)getPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* url = (NSString*)[arguments objectAtIndex:0];

    [self.pageBrowser loadURL:url];
}


- (void)updateFrameSize:(CGFloat)withSideMenu
{
    CGFloat navBarSize = 28;
    if([[UIScreen mainScreen] respondsToSelector:@selector(scale)] &&
       [[UIScreen mainScreen] scale] == 2.0)
    {
        navBarSize = 28;
    }
    CGFloat sideMenuSize = (withSideMenu) ? 200 : 0;
    CGFloat newX;
    CGFloat newY;
    CGFloat newWidth;
    CGFloat newHeight;
    CGRect bigFrame = self.viewController.view.frame;
    
    if (UIInterfaceOrientationIsPortrait([UIApplication sharedApplication].statusBarOrientation)) {
        newX = sideMenuSize;
        newY = bigFrame.origin.y + navBarSize;
        newWidth = bigFrame.size.width - sideMenuSize;
        newHeight = bigFrame.size.height - navBarSize;
    } else {
        // set size
        navBarSize = 48;
        newY = navBarSize;
        newX = bigFrame.origin.y + sideMenuSize;
        newHeight = bigFrame.size.width - navBarSize;
        newWidth = bigFrame.size.height - sideMenuSize;
        
    }
    
    CGRect newFrame = CGRectMake(newX, newY, newWidth, newHeight );
    self.pageBrowser.view.frame = newFrame;
}


- (void)showSideMenu:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  // args:
{
    [self updateFrameSize:TRUE];
}

- (void)hideSideMenu:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  // args:
{
    [self updateFrameSize:FALSE];
}


- (void)close:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options // args: url
{
    [self realClose];
}

- (void)realClose
{
    [self.pageBrowser.view removeFromSuperview];
}

- (void)onClose
{
    [self.webView stringByEvaluatingJavaScriptFromString:@"window.plugins.pageBrowser.onClose();"];
}

- (void)onOpenInSafari
{
    [self.webView stringByEvaluatingJavaScriptFromString:@"window.plugins.pageBrowser.onOpenExternal();"];
}

- (void)onChildLocationChange:(NSString*)newLoc
{
    NSString* tempLoc = [NSString stringWithFormat:@"%@", newLoc];
    NSString* encUrl = [tempLoc stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];

    NSString* jsCallback = [NSString stringWithFormat:@"window.plugins.pageBrowser.onLocationChange('%@');", encUrl];

    [self.webView stringByEvaluatingJavaScriptFromString:jsCallback];
}

- (void)onChildBeforeLocationChange:(NSString*)newLoc
{
    NSString* tempLoc = [NSString stringWithFormat:@"%@", newLoc];
    NSString* encUrl = [tempLoc stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    NSString* jsCallback = [NSString stringWithFormat:@"window.plugins.pageBrowser.onBeforeLocationChange('%@');", encUrl];
    
    [self.webView stringByEvaluatingJavaScriptFromString:jsCallback];
}

- (void)onChildShouldLocationChange:(NSString*)newLoc
{
    NSString* tempLoc = [NSString stringWithFormat:@"%@", newLoc];
    NSString* encUrl = [tempLoc stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    NSString* jsCallback = [NSString stringWithFormat:@"window.plugins.pageBrowser.onShouldLocationChange('%@');", encUrl];
    
    [self.webView stringByEvaluatingJavaScriptFromString:jsCallback];
}

#if !__has_feature(objc_arc)
- (void)dealloc
{
    self.pageBrowser = nil;

    [super dealloc];
}
#endif

@end
