import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Schema } from 'zod';

const extractErrorMessage = (err: any) => {
  const { path, received, message, expected } = err;
  const erroMessage = `Erro:'${message}'.${expected ? ` Esperado:'${expected}'` : ''}`;

  if (received === undefined) {
    return `O campo '${path}' é obrigatório. ${erroMessage}`;
  }

  return `O campo '${path}' recebeu '${received}'. ${erroMessage}`;
};

const validate = (schema: Schema, type: 'body' | 'params' | 'query') => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const parsed = schema.parse(req[type]);
      req[type] = parsed;
    } catch (e: any) {
      if (e.errors) {
        const errArray = e.errors;
        const messages = errArray.map((err: any) => extractErrorMessage(err));

        return reply.status(400).send({ error: 'Validation failed', details: messages });
      } else {
        return reply.status(400).send({ error: e.message });
      }
    }
  };
};

export const validBody = (schema: Schema) => {
  return validate(schema, 'body');
};

export const validParams = (schema: Schema) => {
  return validate(schema, 'params');
};

export const validQuery = (schema: Schema) => {
  return validate(schema, 'query');
};
