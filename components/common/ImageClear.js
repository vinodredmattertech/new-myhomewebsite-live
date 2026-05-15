export const cleanImage = (originalImage) => {
    let imageUrl = "/images/default.svg";
    if (originalImage) {
      // /** When the AWS S3 plugin is activated, images are uploaded to S3 rather than local file system. */
      // if (originalImage.url.startsWith("http")) {
      //   imageUrl = originalImage.url;
      // } else {
      // /** If now S3, then images are stored under the public/uploads directory of Strapi */
      //   imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${originalImage.url}`;
      // }
      imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${originalImage}`;
    }
    return imageUrl;
  };
  export const webFullurl = (originalImage) => {
    let homeUrl = `${process.env.NEXT_PUBLIC_WEBSITE_HOME_URL}`;
    if (originalImage) {
      homeUrl = `${process.env.NEXT_PUBLIC_WEBSITE_HOME_URL}${originalImage}`;
    }
    // console.log("homeUrl", homeUrl);
    return homeUrl;
  };