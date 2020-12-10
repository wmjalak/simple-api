const express = require('express');
const app = express();
const fs = require('fs');

let users = new Array < Object > [];
try {
  const usersString = fs.readFileSync('./users.json')
  users = JSON.parse(usersString);
} catch (err) {
  console.log(err);
  return;
}


app.get('/', (req, res) => {
  res.send('/api/users');
});

app.get('/api/users', (req, res) => {
  const {
    page = 1, limit = 10, order = 'asc'
  } = req.query;

  let {
    filter = '', sort = 'name'
  } = req.query;

  filter = filter !== '' ? filter.toLowerCase() : '';
  sort = ['name', 'email', 'title'].indexOf(sort.toLowerCase()) > -1 ? sort.toLowerCase() : 'name';
  const sortOrder = order === 'desc' ? 1 : -1;

  res.json({
    count: users.length,
    page,
    limit,
    filter,
    sort,
    order: sortOrder === -1 ? 'asc' : 'desc',
    users: users.filter((user) => {
        if (filter !== '') {
          return `${user.name} ${user.email} ${user.title}`.toLowerCase().indexOf(filter) > -1;
        }
        return true;
      }).sort((user1, user2) => {

        const value1 = user1[sort].toLowerCase();
        const value2 = user2[sort].toLowerCase();
        return (value1 < value2) ? (sortOrder) : (value1 > value2) ? (sortOrder * -1) : 0;
      })
      .slice((page - 1) * limit, page * limit)

  });
});

app.get('/api/users/:id', (req, res) => {

  const id = parseInt(req.params.id, 10);
  if (!isNaN(id)) {
    const user = users.find((_user) => _user.id === id);
    if (user) {
      res.json(user);
    }
  }
  res.sendStatus(404);

});

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
