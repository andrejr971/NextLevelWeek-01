import { Request, Response } from 'express';
import Knex from '../database/connection';

class ItemsController {
  async index(req: Request, res: Response) {
    const items = await Knex('items').select('*');

    const serializedItems = items.map((item) => ({
      ...item,
      image_url: `http://192.168.100.86:3333/uploads/${item.image}`,
    }));

    return res.json(serializedItems);
  }
}

export default new ItemsController();
