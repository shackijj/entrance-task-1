# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

I'm a complete beginner in GraphQL. Here are articles and tutorials which I found useful while working on this task:
- https://www.howtographql.com/
- https://www.howtographql.com/graphql-js/1-getting-started/
- https://dev-blog.apollodata.com/designing-graphql-mutations-e09de826ed97

TODO:
- Logins must be unique
- Add avatarUrl to UserInput type
- Why mutation input are not checked before calling .update method?
    The doc below says that if an object is passed to .update method
    Sequlize will iterate through each key and call .set for each key-value pair
    So, I'd be good to check sourcecode about what happens when we pass nullable values
    http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-set

- There aren't any safety checks in resolvers. They should be added