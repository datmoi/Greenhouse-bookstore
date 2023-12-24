package com.greenhouse.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileManagerService {

    private final ResourceLoader resourceLoader;

//    @Value("${upload.path}")
    private String uploadPath;

    public FileManagerService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    private Path getPath(String folder, String filename) {
        try {
            File baseDir = resourceLoader.getResource("classpath:" + uploadPath).getFile();
            File dir = new File(baseDir, folder);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            return Paths.get(dir.getAbsolutePath(), filename);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public byte[] read(String folder, String filename) {
        Path path = this.getPath(folder, filename);
        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public File save(String folder, MultipartFile file) {
        String name = System.currentTimeMillis() + file.getOriginalFilename();
        String filename = Integer.toHexString(name.hashCode()) + name.substring(name.lastIndexOf("."));

        Path path = this.getPath(folder, filename);
        try {
            File saveFile = path.toFile();
            file.transferTo(saveFile);
            System.out.println(saveFile.getAbsolutePath());
            return saveFile;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> multisave(String folder, MultipartFile[] files) {
        List<String> filenames = new ArrayList<String>();
        for (MultipartFile file : files) {
            String name = System.currentTimeMillis() + file.getOriginalFilename();
            String filename = Integer.toHexString(name.hashCode()) + name.substring(name.lastIndexOf("."));
            Path path = this.getPath(folder, filename);
            try {
                file.transferTo(path);
                filenames.add(filename);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return filenames;
    }

    public void delete(String folder, String filename) {
        Path path = this.getPath(folder, filename);
        try {
            Files.delete(path);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> list(String folder) {
        List<String> filenames = new ArrayList<>();
        String baseDir = "static/uploads/";
        Resource resource = resourceLoader.getResource("classpath:" + baseDir + folder);
        try {
            File dir = resource.getFile();
            if (dir.exists()) {
                File[] files = dir.listFiles();
                for (File file : files) {
                    filenames.add(file.getName());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return filenames;
    }
}
