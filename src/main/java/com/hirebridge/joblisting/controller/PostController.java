package com.hirebridge.joblisting.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hirebridge.joblisting.model.Post;
import com.hirebridge.joblisting.repository.PostRepository;
import com.hirebridge.joblisting.repository.SearchRepository;

import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
public class PostController
{

    @Autowired
    PostRepository repo;

    @Autowired
    SearchRepository srepo;

    // Removed Swagger root redirect locally so we can serve index.html


    @GetMapping("/allPosts")
    @CrossOrigin
    public List<Post> getAllPosts()
    {
        return repo.findAll();
    }
    // posts/java
    @GetMapping("/posts/{text}")
    @CrossOrigin
    public List<Post> search(@PathVariable String text)
    {
        try {
            return srepo.findByText(text);
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    @PostMapping("/post")
    @CrossOrigin
    public Post addPost(@RequestBody Post post)
    {
        return repo.save(post);
    }


}
