//! Perceptual frame fingerprint for the follow-along loop.
//!
//! dHash (difference hash): downscale to 17x16 grayscale, then for each row
//! compare each pixel to its right neighbour (16 comparisons x 16 rows = 256
//! bits). Robust to minor pixel noise, sensitive to structural change (scroll,
//! page load, navigation). Comparison is popcount of XOR — nanoseconds.
//! The hash is 8 x u32 so it round-trips to the JS frontend as number[].

pub(crate) const HASH_U32S: usize = 8; // 256 bits

pub(crate) fn dhash_from_bytes(bytes: &[u8]) -> Result<[u32; HASH_U32S], String> {
    let img = image::load_from_memory(bytes).map_err(|e| format!("decode: {e}"))?;
    Ok(dhash(&img))
}

pub(crate) fn dhash(img: &image::DynamicImage) -> [u32; HASH_U32S] {
    let small = img
        .resize_exact(17, 16, image::imageops::FilterType::Triangle)
        .to_luma8();
    let mut bits = [0u32; HASH_U32S];
    let mut idx = 0usize;
    for y in 0..16u32 {
        for x in 0..16u32 {
            let left = small.get_pixel(x, y).0[0];
            let right = small.get_pixel(x + 1, y).0[0];
            if left > right {
                bits[idx / 32] |= 1u32 << (idx % 32);
            }
            idx += 1;
        }
    }
    bits
}

pub(crate) fn hamming(a: &[u32; HASH_U32S], b: &[u32; HASH_U32S]) -> u32 {
    let mut d = 0u32;
    for i in 0..HASH_U32S {
        d += (a[i] ^ b[i]).count_ones();
    }
    d
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, RgbImage};

    fn solid(w: u32, h: u32, v: u8) -> DynamicImage {
        DynamicImage::ImageRgb8(RgbImage::from_pixel(w, h, image::Rgb([v, v, v])))
    }

    #[test]
    fn identical_images_have_zero_distance() {
        let a = dhash(&solid(200, 200, 128));
        let b = dhash(&solid(200, 200, 128));
        assert_eq!(hamming(&a, &b), 0);
    }

    #[test]
    fn a_horizontal_gradient_differs_from_flat() {
        // dHash sets a bit only where a pixel is BRIGHTER than its right neighbour
        // (`left > right`). A flat image gives all-zero bits; so does a *rising*
        // left-to-right gradient (`left < right` everywhere). To be distinguishable
        // from flat, the gradient must brighten toward the LEFT (fall to the right)
        // so every horizontal comparison sets its bit.
        let flat = dhash(&solid(64, 64, 128));
        let mut grad = RgbImage::new(64, 64);
        for (x, _y, px) in grad.enumerate_pixels_mut() {
            let v = ((63 - x) * 4) as u8;
            *px = image::Rgb([v, v, v]);
        }
        let grad = dhash(&DynamicImage::ImageRgb8(grad));
        assert!(hamming(&flat, &grad) > 20, "gradient should be clearly different");
    }
}
