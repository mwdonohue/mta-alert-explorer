package io.github.mwdonohue.api.configuration;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class DBConfig {
    @Value("${DB_CONNECTION_STRING}")
    private String connectionURI;

    @Value("${DB_NAME}")
    private String mtaDBName;

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(connectionURI);
    }

    @Bean
    public MongoDatabaseFactory mtaDatabaseFactory() {
        return new SimpleMongoClientDatabaseFactory(mongoClient(), mtaDBName);
    }


}
