package com.greenhouse.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ImageUploader {
    private static final String CLOUDINARY_CLOUD_NAME = "dmbh3sz8s";
    private static final String CLOUDINARY_API_KEY = "165312227781173";
    private static final String CLOUDINARY_API_SECRET = "xcADjr7hxF6iXNMtsdf2CQAnbOI";

    public static String uploadImage(MultipartFile imageFile, String imageName) throws IOException {
        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", CLOUDINARY_CLOUD_NAME,
                    "api_key", CLOUDINARY_API_KEY,
                    "api_secret", CLOUDINARY_API_SECRET));

            byte[] imageBytes = imageFile.getBytes();

            Map uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.asMap(
                    "public_id", imageName,
                    "folder", "product",
                    "overwrite", true
            ));

            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Lỗi khi tải ảnh lên Cloudinary.", e);
        }
    }

    public static List<String> uploadImagesToCloudinary(MultipartFile[] imageFiles, String imageNamePrefix) throws Exception {
        List<String> photoUrls = new ArrayList<>();

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", CLOUDINARY_CLOUD_NAME,
                "api_key", CLOUDINARY_API_KEY,
                "api_secret", CLOUDINARY_API_SECRET));

        for (MultipartFile imageFile : imageFiles) {
            if (!imageFile.isEmpty()) {
                try {
                    byte[] imageBytes = imageFile.getBytes();

                    String imageName = imageNamePrefix + "_" + System.currentTimeMillis();
                    Map uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.asMap(
                            "public_id", imageName,
                            "folder", "product-images",
                            "overwrite", true));

                    String photoUrl = (String) uploadResult.get("secure_url");
                    photoUrls.add(photoUrl);
                } catch (IOException e) {
                    e.printStackTrace();
                    throw new Exception("Lỗi khi tải ảnh lên Cloudinary.");
                }
            }
        }

        return photoUrls;
    }

}
