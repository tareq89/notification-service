// services/user.service.js
import { User } from "../models/user.js";

/**
 * CREATE
 */
export async function createUser(data) {
  return User.create(data);
}

/**
 * READ
 */
export async function getUserById(id) {
  return User.findById(id);
}

export async function getUsers() {
  return User.find({});
}

/**
 * UPDATE
 */
export async function updateUser(id, data) {
  return User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

/**
 * DELETE
 */
export async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}
