import { Router } from 'express';
import { getAllTickets } from '../dal/tickets.js';
import { GetAllTicketsOptions } from '../dal/tickets.js';
import {
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';
import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';
const router = Router();
router.get('/', async (req, res) => {
  const options: GetAllTicketsOptions = {};

  if (req.query.limit) {
    options.limit = Number(req.query.limit);
  }
  if (req.query.offset) {
    options.offset = Number(req.query.offset);
  }
  if (req.query.status) {
    options.status = req.query.status as string;
  }

  const allTickets = await getAllTickets(options);
  res.json(allTickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  const ticketId = Number(req.params.id);
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found!' });
    return;
  }

  res.json(ticket);
});
// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const creatorId = res.locals.userId;

  const newTicket = await createTicket({
    title,
    description,
    creator_id: creatorId,
  });

  res.status(201).json(newTicket);
});
// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const ticketId = Number(req.params.id);
  const { status } = req.body;

  const updatedTicket = await updateTicketStatus(ticketId, status);

  if (!updatedTicket) {
    res.status(404).json({ error: 'Ticket not found!' });
    return;
  }

  res.json(updatedTicket);
});
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res) => {
  const { hours } = req.body;
  const userId = res.locals.userId;
  const ticketId = Number(req.params.id);

  if (typeof hours !== 'number' || hours <= 0) {
    res.status(400).json({ error: 'Bad request!' });
    return;
  }
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  const newTime = await insertTimeLog(ticketId, userId, hours);
  res.status(201).json(newTime);
});
// GET /tickets/:id/time
router.get('/:id/time', async (req, res) => {
  const ticketId = Number(req.params.id);
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found!' });
    return;
  }
  const totalHours = await getTotalHoursForTicket(ticketId);
  res.json({ ticket_id: ticketId, total_hours: totalHours });
});

export default router;
