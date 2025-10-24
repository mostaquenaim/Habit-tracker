"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Plus,
  X,
  Calendar,
  Target,
  Users,
  Award,
  Zap,
  Star,
  Sparkles,
  LogOut,
  Wand2,
  Lightbulb,
} from "lucide-react";
import * as THREE from "three";
import { motion } from "framer-motion";
import Image from "next/image";

const QuestTracker2 = () => {
  const [user, setUser] = useState({ name: "", id: "" });
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [member, setMember] = useState(null);

  const nameRef = useRef();
  const usernameRef = useRef();
  const imageRef = useRef();

  const unlockedRewards = rewards.filter(
    (r) => user.totalXP >= r.requiredXP && user.level >= r.requiredLevel
  );
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  const taskTypes = ["everyday", "weekday", "weekend", "manual"];

  const [newTask, setNewTask] = useState({
    name: "",
    xp: 10,
    type: "everyday",
    isNegative: false,
  });

  const [newReward, setNewReward] = useState({
    name: "",
    requiredXP: 100,
    requiredLevel: 1,
  });

  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Create glowing orbs
    const orbs = [];
    for (let i = 0; i < 5; i++) {
      const orbGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        transparent: true,
        opacity: 0.4,
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      );
      orbs.push(orb);
      scene.add(orb);
    }

    sceneRef.current = { scene, camera, renderer, particlesMesh, orbs };

    const animate = () => {
      requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
        orb.position.x += Math.cos(Date.now() * 0.001 + i) * 0.001;
        orb.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  const initializeUser = () => {
    const stored = localStorage.getItem("questTrackerData");
    if (stored) {
      const data = JSON.parse(stored);
      setUser(
        data.user || {
          name: "Player",
          id: "user-" + Date.now(),
          totalXP: 0,
          level: 1,
        }
      );
      setTasks(data.tasks || []);
      setCompletions(data.completions || {});
      setRewards(data.rewards || []);
      setAllUsers(data.allUsers || []);
    } else {
      const newUser = {
        name: "Player " + Math.floor(Math.random() * 1000),
        id: "user-" + Date.now(),
        totalXP: 0,
        level: 1,
      };
      setUser(newUser);
      setAllUsers([newUser]);
      saveData({
        user: newUser,
        tasks: [],
        completions: {},
        rewards: [],
        allUsers: [newUser],
      });
    }
    setLoading(false);
  };

  const saveData = (data) => {
    localStorage.setItem("questTrackerData", JSON.stringify(data));
  };

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveData({ user, tasks, completions, rewards, allUsers });
    }
  }, [user, tasks, completions, rewards, allUsers, loading]);

  // Load user data from localStorage
  useEffect(() => {
    const savedMember = localStorage.getItem("member");
    if (savedMember) setMember(JSON.parse(savedMember));
  }, []);

  // Save to localStorage whenever member changes
  useEffect(() => {
    if (member) localStorage.setItem("member", JSON.stringify(member));
  }, [member]);

  const handleJoin = () => {
    const newMember = {
      name: nameRef.current.value,
      username: usernameRef.current.value,
      image: imageRef.current.value || "https://i.pravatar.cc/150",
    };

    console.log(newMember, "newMember");

    setMember(newMember);
    setShowModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("member");
    setMember(null);
  };

  const updateUserInList = (updatedUser) => {
    const users = allUsers.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    const sortedUsers = users.sort((a, b) => b.totalXP - a.totalXP);
    setAllUsers(sortedUsers);
  };

  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  };

  const getXPForNextLevel = (level) => {
    return level * level * 50;
  };

  const currentLevelXP = getXPForNextLevel(user.level - 1);
  const nextLevelXP = getXPForNextLevel(user.level);

  const progressXP = user.totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;

  const progressPercent = (progressXP / requiredXP) * 100;

  const addTask = () => {
    if (!newTask.name.trim()) return;

    const task = {
      id: "task-" + Date.now(),
      ...newTask,
      xp: parseInt(newTask.xp),
    };

    setTasks([...tasks, task]);
    setNewTask({ name: "", xp: 10, type: "everyday", isNegative: false });
    setShowAddTask(false);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
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

    const task = tasks.find((t) => t.id === taskId);
    const xpChange = newCompletions[key] ? task.xp : -task.xp;
    const newTotalXP = Math.max(0, user.totalXP + xpChange);
    const newLevel = calculateLevel(newTotalXP);

    const updatedUser = { ...user, totalXP: newTotalXP, level: newLevel };
    setUser(updatedUser);
    updateUserInList(updatedUser);
  };

  const addReward = () => {
    if (!newReward.name.trim()) return;

    const reward = {
      id: "reward-" + Date.now(),
      ...newReward,
      requiredXP: parseInt(newReward.requiredXP),
      requiredLevel: parseInt(newReward.requiredLevel),
    };

    setRewards([...rewards, reward]);
    setNewReward({ name: "", requiredXP: 100, requiredLevel: 1 });
    setShowAddReward(false);
  };

  const deleteReward = (rewardId) => {
    setRewards(rewards.filter((r) => r.id !== rewardId));
  };

  const getTasksForDate = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return tasks.filter((task) => {
      if (task.type === "everyday") return true;
      if (task.type === "weekday" && !isWeekend) return true;
      if (task.type === "weekend" && isWeekend) return true;
      if (task.type === "manual") return true;
      return false;
    });
  };

  const getDateString = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split("T")[0];
  };

  const dates = Array.from({ length: 7 }, (_, i) => getDateString(i - 3));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = getDateString(-1);
    const tomorrow = getDateString(1);

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";
    if (dateString === tomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Auto-generate personalized quests based on user goals
  const generateQuests = async (preferences) => {
    if (!preferences.trim()) {
      alert("Please enter your interests or goals to generate quests!");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate 3-5 personalized daily quests for someone interested in: ${preferences}.
              Return ONLY a JSON array of objects with this format:
              [{ "name": "Quest name", "xp": number, "type": "everyday|weekday|weekend|manual", "description": "brief description" }]
              Make the XP values appropriate (10-50 for easy, 50-100 for medium tasks).`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw Gemini response:", text);

      // 🧹 Clean out markdown formatting like ```json ... ```
      text = text
        .replace(/```json/i, "") // remove starting ```json
        .replace(/```/g, "") // remove any remaining ```
        .trim();

      let aiSuggestions;
      try {
        aiSuggestions = JSON.parse(text);
        console.log("Parsed AI suggestions:", aiSuggestions);
      } catch (err) {
        console.error("Failed to parse Gemini response:", err);
        aiSuggestions = getMockAISuggestions(preferences);
      }

      setAiSuggestions(aiSuggestions);

      console.log(data, "geminidata");

      // Simulated API response for demo
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // // Mock AI response based on user preferences
      // const mockSuggestions = getMockAISuggestions(preferences);
      // setAiSuggestions(mockSuggestions);
    } catch (error) {
      console.error("AI Quest generation error:", error);
      // Fallback to mock data
      const mockSuggestions = getMockAISuggestions(preferences);
      setAiSuggestions(mockSuggestions);
    } finally {
      setAiLoading(false);
    }
  };

  // Mock AI function for demo
  const getMockAISuggestions = (preferences) => {
    const lowerPref = preferences.toLowerCase();
    const suggestions = [];

    if (lowerPref.includes("fitness") || lowerPref.includes("exercise")) {
      suggestions.push(
        {
          name: "30-minute workout",
          xp: 25,
          type: "everyday",
          description: "Complete a full body workout session",
        },
        {
          name: "10,000 steps",
          xp: 20,
          type: "everyday",
          description: "Walk or run to reach your daily step goal",
        },
        {
          name: "Morning stretch routine",
          xp: 15,
          type: "everyday",
          description: "Start your day with 10 minutes of stretching",
        }
      );
    }

    if (lowerPref.includes("study") || lowerPref.includes("learn")) {
      suggestions.push(
        {
          name: "1 hour focused study",
          xp: 30,
          type: "everyday",
          description: "Dedicated learning time without distractions",
        },
        {
          name: "Read 20 pages",
          xp: 20,
          type: "everyday",
          description: "Expand your knowledge through reading",
        },
        {
          name: "Practice skill building",
          xp: 25,
          type: "weekday",
          description: "Work on developing a specific skill",
        }
      );
    }

    if (lowerPref.includes("meditation") || lowerPref.includes("mindfulness")) {
      suggestions.push(
        {
          name: "10-minute meditation",
          xp: 15,
          type: "everyday",
          description: "Practice mindfulness and breathing",
        },
        {
          name: "Gratitude journaling",
          xp: 10,
          type: "everyday",
          description: "Write down three things you're grateful for",
        }
      );
    }

    // Default suggestions if no specific matches
    if (suggestions.length === 0) {
      suggestions.push(
        {
          name: "Morning planning session",
          xp: 15,
          type: "everyday",
          description: "Plan your day for maximum productivity",
        },
        {
          name: "Evening reflection",
          xp: 10,
          type: "everyday",
          description: "Review your day and lessons learned",
        },
        {
          name: "Digital detox hour",
          xp: 20,
          type: "weekend",
          description: "Spend one hour without screens",
        }
      );
    }

    return suggestions.slice(0, 4); // Return max 4 suggestions
  };

  const addAISuggestion = (suggestion) => {
    const task = {
      id: "task-" + Date.now(),
      name: suggestion.name,
      xp: suggestion.xp,
      type: suggestion.type,
      isNegative: false,
    };

    setTasks([...tasks, task]);
    setAiSuggestions(aiSuggestions.filter((s) => s.name !== suggestion.name));
  };

  const addAllAISuggestions = () => {
    const newTasks = aiSuggestions.map((suggestion) => ({
      id: "task-" + Date.now() + Math.random(),
      name: suggestion.name,
      xp: suggestion.xp,
      type: suggestion.type,
      isNegative: false,
    }));

    setTasks([...tasks, ...newTasks]);
    setAiSuggestions([]);
    setShowAISuggestions(false);
    setUserPreferences("");
  };

  // Provide AI-powered encouragement and insights
  const getProgressInsights = async (userData) => {
    const prompt = `Analyze this user's quest completion data and provide motivational insights: ${JSON.stringify(
      userData
    )}`;
    // Call DeepSeek API for personalized feedback
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 animate-spin" />
          Loading your quest...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] to-[#1a1f35] text-white p-8 relative overflow-hidden">
      {/* Glowing Background */}
      <div id="three-bg" className="absolute inset-0 -z-10"></div>

      {/* Header */}
      {/* <div className="flex justify-between items-center mb-10"> */}
      {/* Member Section */}
      {member ? (
        <div className="perspective-[1000px]">
          <div className="transform-gpu rotate-y-[8deg] hover:rotate-y-[0deg] transition-transform duration-700 flex justify-between items-center mb-10">
            <div className="relative group">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full border-2 border-purple-400 shadow-2xl shadow-[0_0_30px_rgba(168,85,247,0.7)] transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/30 to-purple-500/30 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 -z-10" />
            </div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
            >
              Quest Tracker
            </motion.h1>
            <div className="relative flex items-center gap-4 bg-slate-800/60 px-6 py-6 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.4)] backdrop-blur-md border border-slate-700 transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]">
              <div className="text-center">
                <p className="font-semibold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_5px_rgba(168,85,247,0.4)]">
                  {member.name}
                </p>
                <p className="text-xs text-slate-400">@{member.username}</p>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm mt-1 text-red-400 hover:text-red-300 flex items-center gap-1 transition-transform duration-300 hover:scale-110"
              >
                <LogOut className="w-4 h-4" /> Leave
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
          >
            Quest Tracker
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-pink-500/30"
          >
            ⚔️ Join the Guild
          </motion.button>
        </div>
      )}
      {/* </div> */}

      {/* Join Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Become a Guild Member
            </h2>
            <input
              ref={nameRef}
              placeholder="Your Name"
              className="w-full mb-3 p-3 rounded-md bg-slate-800 text-white border border-slate-700"
            />
            <input
              ref={usernameRef}
              placeholder="Username"
              className="w-full mb-3 p-3 rounded-md bg-slate-800 text-white border border-slate-700"
            />
            <input
              ref={imageRef}
              placeholder="Profile Image URL (optional)"
              className="w-full mb-5 p-3 rounded-md bg-slate-800 text-white border border-slate-700"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 font-semibold"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="fixed inset-0 -z-10" />

      {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-purple-900/70 to-slate-900/70 backdrop-blur-sm" /> */}

      <div className="relative h-full overflow-y-auto">
        <div className="min-h-full p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* Premium Header Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                          {user.name}
                        </h1>
                        <p className="text-purple-300 text-sm mt-1">
                          Quest Master
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-yellow-400/30 shadow-lg shadow-yellow-500/20">
                        <Star className="w-5 h-5 text-yellow-300" />
                        <div>
                          <div className="text-xs text-yellow-200/70">
                            Level
                          </div>
                          <div className="font-bold text-xl text-yellow-100">
                            {user.level}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-300" />
                        <div>
                          <div className="text-xs text-blue-200/70">
                            Total XP
                          </div>
                          <div className="font-bold text-xl text-blue-100">
                            {user.totalXP}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-700 ease-out flex items-center justify-end px-3 shadow-lg shadow-blue-500/50"
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                        >
                          {progressPercent > 15 && (
                            <span className="text-xs font-bold text-white drop-shadow-lg">
                              {Math.floor(progressPercent)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                        <span className="text-purple-200/80">
                          <span className="text-white font-semibold">
                            {progressXP}
                          </span>{" "}
                          / {requiredXP} XP to level up
                        </span>
                        <span className="text-purple-200/80">
                          Next:{" "}
                          <span className="text-white font-semibold">
                            Level {user.level + 1}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tab Navigation */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/10">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {[
                    {
                      id: "tasks",
                      icon: Target,
                      label: "Quests",
                      gradient: "from-emerald-500 to-teal-500",
                    },
                    {
                      id: "leaderboard",
                      icon: Users,
                      label: "Leaderboard",
                      gradient: "from-purple-500 to-pink-500",
                    },
                    {
                      id: "rewards",
                      icon: Award,
                      label: "Rewards",
                      gradient: "from-yellow-500 to-orange-500",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative group/btn flex flex-col sm:flex-row items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r " +
                            tab.gradient +
                            " text-white shadow-lg scale-105"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="text-xs sm:text-base">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl -z-10"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tasks Tab */}
                {activeTab === "tasks" && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                        Daily Quests
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* <button
                          onClick={() => setShowAISuggestions(true)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                        >
                          <Wand2 className="w-5 h-5" />
                          AI Quest Suggestions
                        </button> */}
                        <button
                          onClick={() => setShowAddTask(true)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105"
                        >
                          <Plus className="w-5 h-5" />
                          Add Quest
                        </button>
                      </div>
                    </div>

                    {/* AI Suggestions Modal */}
                    {showAISuggestions && (
                      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10 shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Wand2 className="w-5 h-5 text-purple-300" />
                          AI Quest Generator
                        </h3>

                        {aiSuggestions.length === 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-purple-200 mb-4">
                              <Lightbulb className="w-5 h-5" />
                              <span>
                                Tell me about your goals and I'll suggest
                                personalized quests!
                              </span>
                            </div>
                            <textarea
                              placeholder="e.g., I want to improve my fitness, learn programming, practice mindfulness, read more books..."
                              value={userPreferences}
                              onChange={(e) =>
                                setUserPreferences(e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm min-h-[100px]"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => generateQuests(userPreferences)}
                                disabled={aiLoading}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {aiLoading ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Quests
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setShowAISuggestions(false)}
                                className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all border border-white/10"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-semibold text-lg">
                                Suggested Quests ({aiSuggestions.length})
                              </h4>
                              <button
                                onClick={addAllAISuggestions}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                Add All
                              </button>
                            </div>

                            <div className="grid gap-3">
                              {aiSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 transition-all group"
                                >
                                  <div className="flex-1">
                                    <div className="text-white font-semibold">
                                      {suggestion.name}
                                    </div>
                                    <div className="text-purple-300 text-sm mt-1">
                                      {suggestion.description}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                      <span className="text-blue-300 flex items-center gap-1">
                                        <Zap className="w-4 h-4" />+
                                        {suggestion.xp} XP
                                      </span>
                                      <span className="text-green-300 capitalize">
                                        {suggestion.type}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => addAISuggestion(suggestion)}
                                    className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => generateQuests(userPreferences)}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                              >
                                <Wand2 className="w-4 h-4" />
                                Generate More
                              </button>
                              <button
                                onClick={() => {
                                  setShowAISuggestions(false);
                                  setAiSuggestions([]);
                                  setUserPreferences("");
                                }}
                                className="px-6 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all border border-white/10"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {showAddTask && (
                      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-white/10 shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          Create New Quest
                        </h3>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Quest name"
                            value={newTask.name}
                            onChange={(e) =>
                              setNewTask({ ...newTask, name: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-emerald-400 focus:outline-none transition-all backdrop-blur-sm"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="XP"
                              value={newTask.xp}
                              onChange={(e) =>
                                setNewTask({ ...newTask, xp: e.target.value })
                              }
                              className="px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-emerald-400 focus:outline-none transition-all backdrop-blur-sm"
                            />
                            <select
                              value={newTask.type}
                              onChange={(e) =>
                                setNewTask({ ...newTask, type: e.target.value })
                              }
                              className="px-4 py-3 rounded-xl bg-slate-700/50 text-white border-2 border-white/10 focus:border-emerald-400 focus:outline-none transition-all backdrop-blur-sm"
                            >
                              <option value="everyday">Everyday</option>
                              <option value="weekday">Weekdays</option>
                              <option value="weekend">Weekends</option>
                              <option value="manual">Manual</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-3 text-white cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={newTask.isNegative}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  isNegative: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-2 border-white/20 bg-slate-700/50 checked:bg-red-500 transition-all"
                            />
                            <span className="group-hover:text-red-300 transition-colors">
                              Negative XP (penalty)
                            </span>
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={addTask}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105"
                            >
                              Create Quest
                            </button>
                            <button
                              onClick={() => setShowAddTask(false)}
                              className="bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-semibold transition-all border border-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === "leaderboard" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">
                      Leaderboard
                    </h2>
                    <div className="space-y-3">
                      {allUsers.map((player, index) => (
                        <div
                          key={player.id}
                          className={`group flex items-center justify-between p-4 sm:p-6 rounded-2xl transition-all ${
                            player.id === user.id
                              ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 shadow-xl shadow-yellow-500/20 scale-105"
                              : "bg-slate-800/50 border border-white/10 hover:bg-slate-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-xl sm:text-2xl shadow-lg ${
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                                  : index === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                  : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                  : "bg-slate-700/50 text-white/70"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-base sm:text-lg">
                                {player.name}
                              </div>
                              <div className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                <Star className="w-4 h-4" />
                                Level {player.level}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-400/30 shadow-lg">
                            <Zap className="w-5 h-5 text-blue-300" />
                            <span className="text-white font-bold">
                              {player.totalXP}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rewards Tab */}
                {activeTab === "rewards" && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                        Rewards
                      </h2>
                      <button
                        onClick={() => setShowAddReward(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                        Add Reward
                      </button>
                    </div>

                    {showAddReward && (
                      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-white/10 shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          Create New Reward
                        </h3>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Reward name"
                            value={newReward.name}
                            onChange={(e) =>
                              setNewReward({
                                ...newReward,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Required XP"
                              value={newReward.requiredXP}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  requiredXP: e.target.value,
                                })
                              }
                              className="px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                            />
                            <input
                              type="number"
                              placeholder="Required Level"
                              value={newReward.requiredLevel}
                              onChange={(e) =>
                                setNewReward({
                                  ...newReward,
                                  requiredLevel: e.target.value,
                                })
                              }
                              className="px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={addReward}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105"
                            >
                              Create Reward
                            </button>
                            <button
                              onClick={() => setShowAddReward(false)}
                              className="bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-semibold transition-all border border-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {unlockedRewards.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                          <Award className="w-6 h-6" />
                          Unlocked Rewards
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unlockedRewards.map((reward) => (
                            <div key={reward.id} className="group relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-gradient-to-br from-emerald-500/30 to-teal-500/30 backdrop-blur-xl border-2 border-emerald-400/50 rounded-2xl p-4 sm:p-6 shadow-xl">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-white font-bold text-lg mb-2">
                                      {reward.name}
                                    </div>
                                    <div className="flex items-center gap-3 text-emerald-200 text-sm">
                                      <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        Level {reward.requiredLevel}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Zap className="w-4 h-4" />
                                        {reward.requiredXP} XP
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                                    <Award className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-emerald-300 font-semibold">
                                  <Sparkles className="w-5 h-5" />
                                  <span>Unlocked!</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-4">
                      All Rewards
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rewards.map((reward) => {
                        const isUnlocked =
                          user.totalXP >= reward.requiredXP &&
                          user.level >= reward.requiredLevel;

                        return (
                          <div
                            key={reward.id}
                            className={`group rounded-2xl p-4 sm:p-6 transition-all border ${
                              isUnlocked
                                ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/50 shadow-lg"
                                : "bg-slate-800/50 border-white/10 hover:bg-slate-700/50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="text-white font-bold text-lg mb-2">
                                  {reward.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Level {reward.requiredLevel}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-4 h-4" />
                                    {reward.requiredXP} XP
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteReward(reward.id)}
                                className="text-red-400 hover:text-red-500 hover:bg-red-500/20 p-2 rounded-lg transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            {isUnlocked ? (
                              <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-500/20 px-4 py-2 rounded-xl">
                                <Award className="w-5 h-5" />
                                <span>Unlocked!</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-white/60 text-sm">
                                  <span className="text-white font-semibold">
                                    {reward.requiredXP - user.totalXP}
                                  </span>{" "}
                                  XP needed
                                </div>
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                    style={{
                                      width: `${Math.min(
                                        (user.totalXP / reward.requiredXP) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
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
        </div>
      </div>
    </div>
  );
};

export default QuestTracker2;
