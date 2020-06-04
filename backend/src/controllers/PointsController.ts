import { Request, Response } from 'express';
import Knex from '../database/connection';

class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await Knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return res.json(points);
  }

  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsaap,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await Knex.transaction();

    const insertdIds = await trx('points').insert({
      image: 'image-fake',
      name,
      email,
      whatsaap,
      latitude,
      longitude,
      city,
      uf,
    });

    const point = {
      image:
        'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsaap,
      latitude,
      longitude,
      city,
      uf,
    };

    const point_id = insertdIds[0];

    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    });

    await trx('point_items').insert(pointItems);

    await trx.commit();

    return res.json({ id: point_id, ...point });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await Knex('points').where('id', id).first();

    if (!point) {
      return res.json(404).json({ error: 'Point not found' });
    }

    const items = await Knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return res.json({ point, items });
  }
}

export default new PointsController();
