const connectSequelize = require('../src/sequelize-connector')

function createData ({models}) {
  let usersPromise = models.User.bulkCreate([
    {
      login: 'veged',
      firstName: 'Петр',
      secondName: 'Петров',
      avatarUrl: 'https://avatars3.githubusercontent.com/u/15365?s=460&v=4',
      homeFloor: 0
    },
    {
      firstName: 'Cидор',
      secondName: 'Сидоров',
      login: 'alt-j',
      avatarUrl: 'https://avatars1.githubusercontent.com/u/3763844?s=400&v=4',
      homeFloor: 3
    },
    {
      firstName: 'Иван',
      secondName: 'Иванов',
      login: 'yeti-or',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/1813468?s=460&v=4',
      homeFloor: 2
    }
  ])

  let floorsPromise = models.Floor.bulkCreate([
    {
      floor: 4
    },
    {
      floor: 2
    },
    {
      floor: 3
    }
  ])

  let roomsPromise = models.Room.bulkCreate([
    {
      title: '404',
      capacity: 5
    },
    {
      title: 'Деньги',
      capacity: 4
    },
    {
      title: 'Карты',
      capacity: 4
    },
    {
      title: 'Ствола',
      capacity: 2
    },
    {
      title: '14',
      capacity: 6
    }
  ])

  const HOUR = 60 * 60 * 1000
  const DAY = 24 * 60 * 60 * 1000
  let now = new Date()
  let oneHourLater = new Date(now.getTime() + HOUR)
  let twoHoursLater = new Date(oneHourLater.getTime() + HOUR)
  let threeHoursLater = new Date(twoHoursLater.getTime() + HOUR)

  let oneHourLaterTommorow = new Date(now.getTime() + HOUR + DAY)
  let twoHoursLaterTommorow = new Date(oneHourLater.getTime() + HOUR + DAY)

  let eventsPromise = models.Event.bulkCreate([
    {
      title: 'ШРИ 2018 - начало',
      dateStart: now,
      dateEnd: oneHourLater
    },
    {
      title: '👾 Хакатон 👾',
      dateStart: oneHourLater,
      dateEnd: twoHoursLater
    },
    {
      title: '🍨 Пробуем kefir.js',
      dateStart: twoHoursLater,
      dateEnd: threeHoursLater
    },
    {
      title: 'Lorem Ipsum 1',
      dateStart: twoHoursLater,
      dateEnd: threeHoursLater
    },
    {
      title: 'Lorem Ipsum 2',
      dateStart: oneHourLaterTommorow,
      dateEnd: twoHoursLaterTommorow
    }
  ])

  Promise.all([usersPromise, roomsPromise, eventsPromise, floorsPromise])
    .then(() => Promise.all([
      models.User.findAll(),
      models.Room.findAll(),
      models.Event.findAll(),
      models.Floor.findAll()
    ]))
    .then(function ([users, rooms, events, floors]) {
      let promises = []

      promises.push(rooms[0].setFloor(floors[0]))
      promises.push(rooms[1].setFloor(floors[1]))
      promises.push(rooms[2].setFloor(floors[1]))
      promises.push(rooms[3].setFloor(floors[1]))
      promises.push(rooms[4].setFloor(floors[2]))

      promises.push(users[0].setFloor(floors[0]))
      promises.push(users[1].setFloor(floors[1]))
      promises.push(users[2].setFloor(floors[2]))

      promises.push(events[0].setRoom(rooms[0]))
      promises.push(events[1].setRoom(rooms[1]))
      promises.push(events[2].setRoom(rooms[2]))
      promises.push(events[3].setRoom(rooms[0]))
      promises.push(events[4].setRoom(rooms[0]))

      promises.push(events[0].setUsers([users[0], users[1]]))
      promises.push(events[1].setUsers([users[1], users[2]]))
      promises.push(events[2].setUsers([users[0], users[2]]))
      promises.push(events[3].setUsers([users[0], users[1]]))
      promises.push(events[4].setUsers([users[0], users[1]]))
      return Promise.all(promises)
    })
}

connectSequelize()
  .then(createData)
