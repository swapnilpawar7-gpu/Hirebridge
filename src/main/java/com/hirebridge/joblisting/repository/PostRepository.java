package com.hirebridge.joblisting.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.hirebridge.joblisting.model.Post;

public interface PostRepository extends MongoRepository<Post,String>
{

}
