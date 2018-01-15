## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

Для меня это первый опыт работы с GraphQL. Ресурсы, которыми я пользовался:
- https://www.howtographql.com/
- https://www.howtographql.com/graphql-js/1-getting-started/
- https://dev-blog.apollodata.com/designing-graphql-mutations-e09de826ed97
- https://medium.com/@tarkus/validation-and-user-errors-in-graphql-mutations-39ca79cd00bf
- https://www.youtube.com/watch?v=xaorvBjCE7A

Я старался следовать ТDD при работе над заданием.

Я перенес приложение с graphql-express на apollo-express-server по причине наличия хорошей документации.

TODO:
- Logins must be unique
- Why mutation input are not checked before calling .update method?
    The doc below says that if an object is passed to .update method
    Sequlize will iterate through each key and call .set for each key-value pair
    So, I'd be good to check sourcecode about what happens when we pass nullable values
    http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-set
- Why stacktraced do appear while tests are runned? Is it OK?
