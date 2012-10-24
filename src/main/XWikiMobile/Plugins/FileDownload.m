//
//  FileDownload.m
//  FileDownLoadApp
//
//  Original created by Aaron Saunders on 9/8/10.
//  Copyright 2010 clearly innovative llc. All rights reserved.
//
//  Modified by Johnathan Iannotti on 04/20/2012
//  Twitter: @notticode

#import "FileDownload.h"


@implementation FileDownload


-(CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (FileDownload*)[super initWithWebView:theWebView];
    return self;
}



//
// entry point to  the javascript plugin for PhoneGap
//
-(void) downloadFile:(NSMutableArray*)paramArray withDict:(NSMutableDictionary*)options {
	
	NSLog(@"in FileDownload.downloadFile");
	NSString * sourceUrl = [paramArray objectAtIndex:0];
	NSString * fileName = [paramArray objectAtIndex:1];
	//NSString * completionCallback = [paramArray objectAtIndex:2];
	
	params = [[NSMutableArray alloc] initWithCapacity:2];	
	[params addObject:sourceUrl];
	[params addObject:fileName];
	
	[self downloadFileFromUrl:params];
}

//
// call to excute the download in a background thread
//
-(void) downloadFileFromUrl:(NSMutableArray*)paramArray
{
	NSLog(@"in FileDownload.downloadFileFromUrl");
	[self performSelectorInBackground:@selector(downloadFileFromUrlInBackgroundTask:) withObject:paramArray];
}

//
// downloads the file in the background and saves it to the local documents
// directory for the application
//
-(void) downloadFileFromUrlInBackgroundTask:(NSMutableArray*)paramArray
{
    NSLog(@"in FileDownload.downloadFileFromUrlInBackgroundTask");
    NSString * sourceUrl = [paramArray objectAtIndex:0];
    NSString * fileName = [paramArray objectAtIndex:1];
    NSString *fullURI = [NSString stringWithFormat:@"%@/%@", sourceUrl, fileName];
    
    NSLog(@"%@",fullURI);
    
    NSError* error=[[[NSError alloc]init] autorelease]; 
	
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    NSData* theData = [NSData dataWithContentsOfURL:[NSURL URLWithString:fullURI]];
	
	// save file in documents directory
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
	NSString *documentsDirectory = [paths objectAtIndex:0];	
	
	NSString *newFilePath = [documentsDirectory stringByAppendingString:[NSString stringWithFormat: @"/%@", fileName]];
    //NSString *newFilePath = [[[NSBundle mainBundle] resourcePath] stringByAppendingString:fileName];
	
	NSLog(@"Writing file to path %@", newFilePath);
	
	BOOL response = [theData writeToFile:newFilePath options:NSDataWritingFileProtectionNone error:&error];
	
	if ( response == NO ) {
		// NSLog(@"file save result %@", [error localizedDescription]);
        NSLog(@"file save error");
        
		// send our results back to the main thread  
		[self performSelectorOnMainThread:@selector(downloadComplete:)  
							   withObject:fileName waitUntilDone:YES];  	
	} else {
		NSLog(@"No Error, file saved successfully");
		
		// send our results back to the main thread  
		[self performSelectorOnMainThread:@selector(downloadComplete:)  
							   withObject:newFilePath waitUntilDone:YES];  	
		
	}
	[pool drain];
}

//
// calls the predefined callback in the ui to indicate completion
//
-(void) downloadComplete:(NSString *)filePath {
	NSLog(@"in FileDownload.downloadComplete");	
	NSString * jsCallBack = [NSString stringWithFormat:@"FileDownloadComplete('%@');",filePath];    
	[self writeJavascript: jsCallBack];
}

//
// calls the predefined callback in the ui to indicate completion with error
//
-(void) downloadCompleteWithError:(NSString *)errorStr {
	NSLog(@"in FileDownload.downloadCompleteWithError");	
	NSString * jsCallBack = [NSString stringWithFormat:@"FileDownloadCompleteWithError('%@');",errorStr];    
	[self writeJavascript: jsCallBack];	
}

- (void)dealloc
{
	if (params) {
		[params release];
	}
    [super dealloc];
}


@end
