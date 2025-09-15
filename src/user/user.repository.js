const prisma = require('../db/index');

const findUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return users;
};

const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const insertUser = async (userData) => {
  const user = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const editUser = async (id, userData) => {
  const user = await prisma.user.update({
    where: { id },
    data: userData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
};

const deleteUser = async (id) => {
  await prisma.user.delete({
    where: { id }
  });
};

module.exports = {
  findUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  editUser,
  deleteUser
};