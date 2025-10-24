'use client'
import React, { useState, useEffect } from 'react';
import { Trophy, Plus, X, Calendar, Target, Users, Award, Zap, Star } from 'lucide-react';

const QuestTracker = () => {
  const [user, setUser] = useState({ name: '', id: '' });
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);

  const taskTypes = ['everyday', 'weekday', 'weekend', 'manual'];
  
  const [newTask, setNewTask] = useState({
    name: '',
    xp: 10,
    type: 'everyday',
    isNegative: false
  });

  const [newReward, setNewReward] = useState({
    name: '',
    requiredXP: 100,
    requiredLevel: 1
  });

  useEffect(() => {
    initializeUser();
    loadData();
  }, []);

  const initializeUser = () => {
    let currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      setUser(currentUser);
    } else {
      const newUserId = 'user-' + Date.now();
      const newUser = { 
        name: 'Player ' + Math.floor(Math.random() * 1000), 
        id: newUserId,
        totalXP: 0,
        level: 1
      };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // Add to all users list
      const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
      users.push(newUser);
      localStorage.setItem('allUsers', JSON.stringify(users));
      
      setUser(newUser);
    }
    setLoading(false);
  };

  const loadData = () => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletions = localStorage.getItem('completions');
    const storedRewards = localStorage.getItem('rewards');
    const storedUsers = localStorage.getItem('allUsers');

    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedCompletions) setCompletions(JSON.parse(storedCompletions));
    if (storedRewards) setRewards(JSON.parse(storedRewards));
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      setAllUsers(users.sort((a, b) => b.totalXP - a.totalXP));
    }
  };

  const updateUserInList = (updatedUser) => {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    
    const sortedUsers = users.sort((a, b) => b.totalXP - a.totalXP);
    localStorage.setItem('allUsers', JSON.stringify(sortedUsers));
    setAllUsers(sortedUsers);
  };

  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  };

  const getXPForNextLevel = (level) => {
    return level * level * 50;
  };

  const addTask = () => {
    if (!newTask.name.trim()) return;
    
    const task = {
      id: 'task-' + Date.now(),
      ...newTask,
      xp: parseInt(newTask.xp)
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    setNewTask({ name: '', xp: 10, type: 'everyday', isNegative: false });
    setShowAddTask(false);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const toggleTaskCompletion = (taskId, date) => {
    const key = `${date}-${taskId}`;
    const newCompletions = { ...completions };
    
    if (newCompletions[key]) {
      delete newCompletions[key];
    } else {
      newCompletions[key] = true;
    }
    
    setCompletions(newCompletions);
    localStorage.setItem('completions', JSON.stringify(newCompletions));
    
    const task = tasks.find(t => t.id === taskId);
    const xpChange = newCompletions[key] ? task.xp : -task.xp;
    const newTotalXP = Math.max(0, user.totalXP + xpChange);
    const newLevel = calculateLevel(newTotalXP);
    
    const updatedUser = { ...user, totalXP: newTotalXP, level: newLevel };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    updateUserInList(updatedUser);
  };

  const addReward = () => {
    if (!newReward.name.trim()) return;
    
    const reward = {
      id: 'reward-' + Date.now(),
      ...newReward,
      requiredXP: parseInt(newReward.requiredXP),
      requiredLevel: parseInt(newReward.requiredLevel)
    };
    
    const updatedRewards = [...rewards, reward];
    setRewards(updatedRewards);
    localStorage.setItem('rewards', JSON.stringify(updatedRewards));
    
    setNewReward({ name: '', requiredXP: 100, requiredLevel: 1 });
    setShowAddReward(false);
  };

  const deleteReward = (rewardId) => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    setRewards(updatedRewards);
    localStorage.setItem('rewards', JSON.stringify(updatedRewards));
  };

  const getTasksForDate = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    return tasks.filter(task => {
      if (task.type === 'everyday') return true;
      if (task.type === 'weekday' && !isWeekend) return true;
      if (task.type === 'weekend' && isWeekend) return true;
      if (task.type === 'manual') return true;
      return false;
    });
  };

  const getDateString = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = getDateString(-1);
    const tomorrow = getDateString(1);
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    if (dateString === tomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentLevelXP = getXPForNextLevel(user.level - 1);
  const nextLevelXP = getXPForNextLevel(user.level);
  const progressXP = user.totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressPercent = (progressXP / requiredXP) * 100;

  const dates = Array.from({ length: 7 }, (_, i) => getDateString(i - 3));

  const unlockedRewards = rewards.filter(r => user.totalXP >= r.requiredXP && user.level >= r.requiredLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your quest...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-xl">Level {user.level}</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-300" />
                  <span className="font-bold">{user.totalXP} XP</span>
                </div>
              </div>
            </div>
            <Trophy className="w-16 h-16 text-yellow-300" />
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              {progressPercent > 10 && <span className="text-xs font-bold text-white">{Math.floor(progressPercent)}%</span>}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2 opacity-80">
            <span>{progressXP} / {requiredXP} XP to next level</span>
            <span>Next: Level {user.level + 1}</span>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'tasks' 
                  ? 'bg-white text-purple-900' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Target className="w-5 h-5" />
              Quests
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'leaderboard' 
                  ? 'bg-white text-purple-900' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Users className="w-5 h-5" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'rewards' 
                  ? 'bg-white text-purple-900' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Award className="w-5 h-5" />
              Rewards
            </button>
          </div>

          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Daily Quests</h2>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Quest
                </button>
              </div>

              {showAddTask && (
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-bold mb-3">Create New Quest</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Quest name"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-2 border-transparent focus:border-white focus:outline-none"
                    />
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="XP"
                        value={newTask.xp}
                        onChange={(e) => setNewTask({ ...newTask, xp: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-2 border-transparent focus:border-white focus:outline-none"
                      />
                      <select
                        value={newTask.type}
                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border-2 border-transparent focus:border-white focus:outline-none"
                      >
                        <option value="everyday">Everyday</option>
                        <option value="weekday">Weekdays</option>
                        <option value="weekend">Weekends</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={newTask.isNegative}
                        onChange={(e) => setNewTask({ ...newTask, isNegative: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <span>Negative XP (penalty)</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={addTask}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        Create Quest
                      </button>
                      <button
                        onClick={() => setShowAddTask(false)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {dates.map(date => {
                  const dateTasks = getTasksForDate(date);
                  if (dateTasks.length === 0) return null;
                  
                  return (
                    <div key={date} className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-white" />
                        <h3 className="text-white font-bold text-lg">{formatDate(date)}</h3>
                      </div>
                      <div className="space-y-2">
                        {dateTasks.map(task => {
                          const key = `${date}-${task.id}`;
                          const isCompleted = completions[key];
                          
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                isCompleted 
                                  ? 'bg-green-500 bg-opacity-30' 
                                  : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => toggleTaskCompletion(task.id, date)}
                                  className="w-6 h-6 cursor-pointer"
                                />
                                <div>
                                  <div className="text-white font-semibold">{task.name}</div>
                                  <div className="text-sm text-white text-opacity-70">
                                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                  task.isNegative ? 'bg-red-500' : 'bg-blue-500'
                                }`}>
                                  <Zap className="w-4 h-4 text-white" />
                                  <span className="text-white font-bold">
                                    {task.isNegative ? '-' : '+'}{Math.abs(task.xp)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-red-300 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
              <div className="space-y-3">
                {allUsers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      player.id === user.id 
                        ? 'bg-yellow-500 bg-opacity-30 border-2 border-yellow-400' 
                        : 'bg-white bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-300' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-orange-300' : 
                        'text-white'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">{player.name}</div>
                        <div className="text-white text-opacity-70 text-sm">Level {player.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-300" />
                      <span className="text-white font-bold">{player.totalXP} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Rewards</h2>
                <button
                  onClick={() => setShowAddReward(true)}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Reward
                </button>
              </div>

              {showAddReward && (
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-bold mb-3">Create New Reward</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Reward name"
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-2 border-transparent focus:border-white focus:outline-none"
                    />
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Required XP"
                        value={newReward.requiredXP}
                        onChange={(e) => setNewReward({ ...newReward, requiredXP: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-2 border-transparent focus:border-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Required Level"
                        value={newReward.requiredLevel}
                        onChange={(e) => setNewReward({ ...newReward, requiredLevel: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-2 border-transparent focus:border-white focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addReward}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        Create Reward
                      </button>
                      <button
                        onClick={() => setShowAddReward(false)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {unlockedRewards.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-green-300 mb-3">Unlocked Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unlockedRewards.map(reward => (
                      <div key={reward.id} className="bg-green-500 bg-opacity-30 border-2 border-green-400 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-bold text-lg">{reward.name}</div>
                            <div className="text-green-200 text-sm mt-1">
                              Level {reward.requiredLevel} • {reward.requiredXP} XP
                            </div>
                          </div>
                          <Award className="w-8 h-8 text-yellow-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-3">All Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rewards.map(reward => {
                  const isUnlocked = user.totalXP >= reward.requiredXP && user.level >= reward.requiredLevel;
                  
                  return (
                    <div
                      key={reward.id}
                      className={`rounded-xl p-4 transition-all ${
                        isUnlocked 
                          ? 'bg-green-500 bg-opacity-20 border-2 border-green-400' 
                          : 'bg-white bg-opacity-10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg">{reward.name}</div>
                          <div className="text-white text-opacity-70 text-sm mt-1">
                            Requires Level {reward.requiredLevel} • {reward.requiredXP} XP
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="text-red-300 hover:text-red-500 transition-colors ml-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {isUnlocked ? (
                        <div className="flex items-center gap-2 text-green-300 font-semibold">
                          <Award className="w-5 h-5" />
                          <span>Unlocked!</span>
                        </div>
                      ) : (
                        <div className="text-white text-opacity-60 text-sm">
                          {reward.requiredXP - user.totalXP} XP needed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestTracker;