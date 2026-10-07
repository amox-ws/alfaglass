import { getImageProps } from "next/image";
import { preload } from "react-dom";

/**
 * Starts an image's download from the document head (React's `preload`, which is what `<Image preload>` does) for an `<Image>` that is
 * lazy but sits in the first screen of a phone: the browser would only find it after the layout, behind the scripts, and it is the
 * largest thing painted there, so its paint time is the page's LCP. `sizes` has to be the one the image itself uses, or the browser
 * would fetch another file and the hint would be wasted.
 */
export function preloadImage(src: string, sizes: string) {
  const { props } = getImageProps({ src, alt: "", fill: true, sizes });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
}
