//
//  SSViewController.m
//  Slideshow
//
//  Created by 汤海波 on 9/1/14.
//  Copyright (c) 2014 All In Palm. All rights reserved.
//

#import "SSViewController.h"

@interface SSViewController ()
@property (weak, nonatomic) IBOutlet UIWebView *webView;

@end

@implementation SSViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    NSString *path = [[[NSBundle mainBundle] bundlePath]
                      stringByAppendingString:@"/Famo"];
    NSURL *url = [NSURL URLWithString:@"index.html"
                        relativeToURL:[NSURL fileURLWithPath:path] ];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [self.webView loadRequest:request];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - actions
- (IBAction)onReloadBtnClicked:(id)sender {
    [self.webView reload];
}


@end
