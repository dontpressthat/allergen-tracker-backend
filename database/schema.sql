DROP DATABASE IF EXISTS tracker;

CREATE DATABASE tracker;

USE tracker;

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(20) NOT NULL,
    effect VARCHAR(20) NULL
);

CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE junction (
    foodId INT NOT NULL,
    ingredientId INT NOT NULL,
    PRIMARY KEY (foodId, ingredientId),
    FOREIGN KEY (foodId) REFERENCES foods (id),
    FOREIGN KEY (ingredientId) REFERENCES ingredients (id)
);