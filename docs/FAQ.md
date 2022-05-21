# Frequently Asked Questions

## What is it?

Firefiles is an open-source alternative to Dropbox that allows you to bring your own cloud provider and lets you manage files across all providers seamlessly and without any hassle.

## Is this a file hosting service?

Nope. We do not host your files. The cloud providers do (AWS, Digital Ocean etc). We simply provide you with a file system interface for those cloud providers.

## How does it work?

We ask for your credentials for each provider you want to use. We then use those credentials to connect to the provider and fetch the files you want to manage. This is all done client-side (in the browser) and none of your files go through our server. Furthermore, we use a strong AES-256 encryption to store the credentials in our database.

## Who is this for?

This software is aimed at people and developers who care for their privacy and want to have a more secure file storage. This is also for people/businesses who want to store private documents but they can't risk storing it in Google Drive. Additionally, this is also for people who want a more personal file storage and who want to fully own and control the cloud they use.

If you want to move away from Google Drive or Dropbox and want a more better and flexible solution, then this is for you.

## Why do I need this?

Cloud providers like Firebase and AWS provide you with a fluid pricing where you can actually pay as you go and only pay for the services you use. The cool thing about this is when you are paying for storage in Firebase or s3 it has much different pricing, limitations, and terms of service to google drive.

Based on terms of service alone, using Firebase or s3 is more "private". Google is not interrogating people's Firebase storage for aggregation and generally they have no idea what is stored in it. You also have more flexibility with moving storage providers, backups, custom integrations etc.

TLDR; You get flexible pricing, definitely more privacy and access to more cool features which Firebase, AWS and other cloud providers have to offer.

## Where are the files stored? Do you have access to my files?

Your files are stored in the storage provider you choose (Firebase, AWS, Digital Ocean etc.) We don't store those files and they never reach our servers.

## What about pricing? Who is paying for my files?

The cloud provider which you choose will bill you for whatever storage and bandwidth you use.

## What makes this different to Dropbox or Google Drive?

We don't provide cloud storage. We let you bring a cloud provider of your own choice and we give you a file system interface to manage your files seamlessly. Google Drive and Dropbox plans are fixed (as in $10/m for 2tb) but cloud providers like Firebase and AWS provide you with a fluid pricing where you can actually pay as you go and only pay for the services you use. Additionally, Dropbox free tier gives you 2gb of storage while Firebase gives you 5gb. While you could directly use Firebase or AWS's console, let's just admit that they have an embarassing and confusing UI/UX.

## Do you have plans for a Desktop / Mobile app?

Yes! We do! We can't provide a time frame for this yet, but we can only say that it is surely coming soon.

## I wanted **\_\_** as a provider but I couldn't find it.

Create an issue at https://github.com/faisalsayed10/firefiles/issues and we'll add it for you (or if you're a developer yourself, we'd love some contributions!) :)
