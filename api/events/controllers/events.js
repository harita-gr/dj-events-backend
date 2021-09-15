"use strict";
const {sanitizeEntity} = require('strapi-utils') ;

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  //Create event with linked user
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.events.create(data, { files });
    } else {
      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.events.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.events });
  },

    //Update event with linked user
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [events] = await strapi.services.events.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    });

    if (!events) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.events.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.events.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.events });
  },

   //Delete event with linked user

  async delete(ctx) {
    const { id } = ctx.params;

    const [events] = await strapi.services.events.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    });

    if (!events) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.events.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.events });
  },

  //Get logged in users
  async me(ctx) { //context object
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { message: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.events.find({user: user.id});

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, {model: strapi.models.events});
  },
};
