import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity data is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !mongoose.isValidObjectId(userId) ||
    typeof teamId !== 'string' ||
    !mongoose.isValidObjectId(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity data is invalid'), { status: 400 });
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('Activity user or team does not exist'), { status: 400 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team data is required'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    !Array.isArray(members) ||
    !members.every((member) => typeof member === 'string' && mongoose.isValidObjectId(member))
  ) {
    throw Object.assign(new Error('Team data is invalid'), { status: 400 });
  }

  const memberIds = [...new Set(members as string[])];
  const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
  if (existingMembers !== memberIds.length) {
    throw Object.assign(new Error('One or more team members do not exist'), { status: 400 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).select('name').lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals.flatMap(({ _id, totalPoints }, index) => {
    const teamName = teamNames.get(_id.toString());
    return teamName ? [{ teamName, totalPoints, rank: index + 1 }] : [];
  });
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activity] = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    walk: 'endurance',
    strength: 'strength',
  };
  const focus = (activity && activityFocus[activity.type.toLowerCase()]) || user.fitnessGoal;
  const workouts = await Workout.find().lean();

  return workouts
    .map((workout) => ({
      ...workout,
      reason: activity
        ? `Suggested based on your ${activity.type} activity and ${focus} focus.`
        : `Suggested to support your ${focus} fitness goal.`,
      matchesFocus: workout.focus.toLowerCase() === focus.toLowerCase(),
    }))
    .sort((first, second) => Number(second.matchesFocus) - Number(first.matchesFocus))
    .map(({ matchesFocus: _matchesFocus, ...workout }) => workout);
}

export { User };
