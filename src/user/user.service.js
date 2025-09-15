const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  findUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  editUser,
  deleteUser
} = require('./user.repository');

const getAllUsers = async () => {
  const users = await findUsers();
  return users;
};

const getUserById = async (id) => {
  if (typeof id !== "number") {
    throw Error("ID is not a number");
  }

  const user = await findUserById(id);
  if (!user) {
    throw Error("User not found");
  }

  return user;
};

const registerUser = async (userData) => {
  const { name, email, phone, password, role } = userData;

  // Validate required fields
  if (!name || !email || !password) {
    throw Error("Name, email, and password are required");
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw Error("User with this email already exists");
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const newUser = await insertUser({
    name,
    email,
    phone,
    password: hashedPassword,
    role: role || 'USER'
  });

  return newUser;
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw Error("Email and password are required");
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    throw Error("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

const updateUser = async (id, userData) => {
  await getUserById(id); // Check if user exists

  const { name, email, phone, password, role } = userData;

  // Prepare update data
  const updateData = {};
  if (name) updateData.name = name;
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id !== id) {
      throw Error("Email is already taken by another user");
    }
    updateData.email = email;
  }
  if (phone !== undefined) updateData.phone = phone;
  if (role) updateData.role = role;

  // Hash new password if provided
  if (password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(password, saltRounds);
  }

  const updatedUser = await editUser(id, updateData);
  return updatedUser;
};

const deleteUserById = async (id) => {
  await getUserById(id); // Check if user exists
  await deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUserById
};