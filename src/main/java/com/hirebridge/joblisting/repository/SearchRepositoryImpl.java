package com.hirebridge.joblisting.repository;

import com.hirebridge.joblisting.model.Post;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;


@Component
public class SearchRepositoryImpl implements SearchRepository{

    @Autowired
    MongoClient client;

    @Autowired
    MongoConverter converter;

    @Override
    public List<Post> findByText(String text) {

        final List<Post> posts = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return posts;
        }

        try {
            MongoDatabase database = client.getDatabase("hirebridge");
            MongoCollection<Document> collection = database.getCollection("JobPost");

            try {
                AggregateIterable<Document> result = collection.aggregate(Arrays.asList(
                        new Document("$search",
                                new Document("text",
                                        new Document("query", text)
                                                .append("path", Arrays.asList("techs", "desc", "profile")))),
                        new Document("$sort", new Document("exp", 1L)),
                        new Document("$limit", 5L)));

                result.forEach(doc -> posts.add(converter.read(Post.class, doc)));
            } catch (Exception atlasSearchError) {
                Pattern regex = Pattern.compile(Pattern.quote(text.trim()), Pattern.CASE_INSENSITIVE);
                Document regexQuery = new Document("$or", Arrays.asList(
                        new Document("profile", regex),
                        new Document("desc", regex),
                        new Document("techs", regex)));

                collection.find(regexQuery)
                        .sort(new Document("exp", 1))
                        .limit(5)
                        .forEach(doc -> posts.add(converter.read(Post.class, doc)));
            }
        } catch (Exception ignored) {
            return new ArrayList<>();
        }

        return posts;
    }
}
