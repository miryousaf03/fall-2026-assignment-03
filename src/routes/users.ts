import { Router } from 'express';
import { getAllUsers } from '../dal/users.js';
import { getUserById } from '../dal/users.js';
import { createUser } from '../dal/users.js';
const router = Router();

// GET /users
router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const userIdNum = Number(userId);
  const user = await getUserById(userIdNum);
  if (!user) {
    res.status(404).json({ error: 'User not Found!' });
    return;
  }
  res.json(user);
});

// POST /users
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  const newUser = await createUser({ name, email });
  res.status(201).json(newUser);
});
export default router;
