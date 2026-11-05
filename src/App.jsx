import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import "./App.css";

const STORAGE_KEY = "stride-history";
const METHOD_OPTIONS = [
  "Worked examples",
  "Analogies and storytelling",
  "Visual explanations",
  "Step-by-step explanations",
  "Active recall and guided questioning",
];
const SAMPLE_TOPICS = [
  "Geographic Information Systems",
  "Calculus",
  "Thermodynamics",
  "Statistics",
  "Computer Programming",
];
const PASS_MARK = 0.8;
const TOPIC_FACTS = [
  [/geograph|gis|mapping|cartograph/i, "GIS can layer different kinds of information—like roads, rivers, and population—on one map to reveal patterns that are hard to spot separately."],
  [/calculus|derivative|integral/i, "The word calculus comes from the Latin for a small pebble, once used for counting. Today, calculus helps describe change and accumulation."],
  [/thermodynamic|heat|energy/i, "A temperature difference can transfer energy as heat; the energy moves from warmer to cooler regions until they reach thermal equilibrium."],
  [/statistic|probability|data science/i, "A sample can tell us about a much larger population, but how it was selected matters as much as how large it is."],
  [/programming|computer science|coding|algorithm/i, "An algorithm is a precise sequence of steps. A recipe is a familiar everyday example of an algorithm."],
  [/biology|cell|genetic|ecology/i, "The cells in your body share the same DNA, but different cells use different sets of genes to do different jobs."],
  [/physics|motion|mechanic/i, "In physics, a model is useful not because it includes every detail, but because it keeps the details needed to answer a particular question."],
  [/chemistry|molecule|chemical/i, "A teaspoon of water contains roughly 1.7 × 10²³ molecules—far more than the number of stars in the Milky Way."],
  [/history|historical/i, "Historians compare multiple sources because each one reflects the perspective, purpose, and context of its creator."],
  [/language|literature|writing|grammar/i, "Reading a sentence in context can change how a word is understood; meaning often comes from the relationship between words."],
];

function getTopicFunFact(topic) {
  const match = TOPIC_FACTS.find(([pattern]) => pattern.test(topic));
  return match
    ? match[1]
    : `Fun fact: when learning ${topic}, trying to explain a new idea in your own words helps you spot what you understand—and what you want to explore next.`;
}

function LearningIllustration() {
  return (
    <div className="hero-art" role="img" aria-label="A playful illustrated map with learning cards">
      <svg className="map-illustration" viewBox="0 0 520 390" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="map-bg" x1="72" y1="31" x2="450" y2="352" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C8F6E7" />
            <stop offset="1" stopColor="#B9C9FF" />
          </linearGradient>
          <linearGradient id="map-land" x1="160" y1="91" x2="374" y2="302" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7D6" />
            <stop offset="1" stopColor="#FFD5C5" />
          </linearGradient>
          <filter id="card-shadow" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <ellipse cx="273" cy="342" rx="184" ry="22" fill="#22234B" fillOpacity=".1" />
        <rect x="75" y="34" width="366" height="306" rx="34" fill="url(#map-bg)" />
        <path d="M75 186C125 165 136 120 186 123C236 126 237 180 293 174C349 168 371 106 441 120V306C388 291 365 318 313 305C264 293 250 251 202 257C154 263 130 309 75 295V186Z" fill="#7EDCC0" />
        <path d="M87 220C135 190 153 204 190 177C235 144 261 153 294 182C333 216 361 195 426 157" stroke="#FFFDF8" strokeWidth="13" strokeLinecap="round" />
        <path d="M111 92C152 116 171 149 206 151C246 153 274 106 311 101C350 96 365 133 408 141" stroke="#FFFDF8" strokeWidth="9" strokeLinecap="round" />
        <path d="M137 309C160 273 176 233 215 214C253 195 280 218 316 230C351 242 379 230 415 207" stroke="#FFFDF8" strokeWidth="8" strokeLinecap="round" />
        <path d="M205 102C195 125 202 148 219 166M343 124C329 149 331 171 349 191M276 248C293 269 300 288 291 309" stroke="#FFFDF8" strokeWidth="6" strokeLinecap="round" />
        <path d="M169 196C169 179 183 165 200 165C217 165 231 179 231 196C231 219 200 244 200 244C200 244 169 219 169 196Z" fill="#FF7187" />
        <circle cx="200" cy="195" r="10" fill="white" />
        <circle cx="340" cy="155" r="13" fill="#755FE8" stroke="white" strokeWidth="7" />
        <circle cx="292" cy="266" r="10" fill="#FFB648" stroke="white" strokeWidth="6" />
        <rect x="288" y="51" width="104" height="42" rx="16" fill="white" />
        <path d="M307 71H324M333 71H371" stroke="#B6B4D3" strokeWidth="6" strokeLinecap="round" />
        <rect x="44" y="142" width="112" height="60" rx="19" fill="white" />
        <circle cx="67" cy="172" r="11" fill="#FFB648" />
        <path d="M87 166H136M87 178H123" stroke="#B6B4D3" strokeWidth="6" strokeLinecap="round" />
        <rect x="351" y="260" width="116" height="58" rx="19" fill="white" />
        <path d="M372 282H441M372 296H421" stroke="#B6B4D3" strokeWidth="6" strokeLinecap="round" />
        <circle cx="438" cy="85" r="20" fill="#FFB648" />
        <path d="M430 85L436 91L447 78" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M82 61L87 72L99 74L90 82L92 94L82 88L72 94L74 82L65 74L77 72L82 61Z" fill="#FF7187" />
        <path d="M444 190L448 199L458 201L451 208L453 218L444 213L435 218L437 208L430 201L440 199L444 190Z" fill="#755FE8" />
      </svg>
      <div className="art-chip chip-one"><span>✦</span> Curiosity activated</div>
      <div className="art-chip chip-two"><span>↗</span> Your next aha moment</div>
    </div>
  );
}

function getStoredHistory(userId) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function TopicProgress({ path, completedTiles = [] }) {
  if (!path?.milestones?.length) {
    return null;
  }

  const completedCount = path.milestones.reduce(
    (total, _milestone, index) => total + (completedTiles.includes(index) ? 1 : 0),
    0
  );
  const percent = Math.round((completedCount / path.milestones.length) * 100);

  return (
    <section className="topic-progress" aria-label="Topic scope and progress">
      <div className="topic-progress-heading">
        <div>
          <span className="progress-kicker">YOUR TOPIC MAP</span>
          <h3>{path.levelTitle}</h3>
          <p>{path.scopeSummary}</p>
        </div>
        <div className="progress-percent">{percent}%<span> explored</span></div>
      </div>
      <div
        className="scope-progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Topic scope explored"
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="scope-milestones">
        {path.milestones.map((milestone, index) => {
          const complete = completedTiles.includes(index);
          return (
            <div className={`scope-milestone${complete ? " complete" : ""}`} key={`${milestone.title}-${index}`}>
              <span className="milestone-mark">{complete ? "✓" : index + 1}</span>
              <span>{milestone.title}</span>
            </div>
          );
        })}
      </div>
      <p className="badge-hint">🏅 Explore every tile and pass the final challenge at 80% to earn your level badge.</p>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [topic, setTopic] = useState("Geographic Information Systems");
  const [level, setLevel] = useState("University");
  const [stage, setStage] = useState("setup");
  const [activePanel, setActivePanel] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [materialUploading, setMaterialUploading] = useState(false);
  const [materialMessage, setMaterialMessage] = useState("");
  const [imageLoadingIndex, setImageLoadingIndex] = useState(null);
  const [method, setMethod] = useState("Worked examples");
  const [lessonTiles, setLessonTiles] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [visitedTiles, setVisitedTiles] = useState([]);
  const [activeTile, setActiveTile] = useState(0);
  const [assessmentAttempt, setAssessmentAttempt] = useState(1);
  const [assessmentId, setAssessmentId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [diagnosticScore, setDiagnosticScore] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [assessmentMaxScore, setAssessmentMaxScore] = useState(0);
  const [firstMethodMaxScore, setFirstMethodMaxScore] = useState(0);
  const [writtenFeedback, setWrittenFeedback] = useState([]);
  const [firstWrittenFeedback, setFirstWrittenFeedback] = useState([]);
  const [firstMethodScore, setFirstMethodScore] = useState(null);
  const [firstMethod, setFirstMethod] = useState("");
  const [experimentRound, setExperimentRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState("");
  const [loadingTitle, setLoadingTitle] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [history, setHistory] = useState([]);
  const lessonScrollerRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        setUser(session?.user || null);
        setHistory(session?.user ? getStoredHistory(session.user.id) : []);
        if (!session?.user) {
          setCourseMaterials([]);
        }
        setAuthLoading(false);
        setAuthError("");
        if (event === "PASSWORD_RECOVERY") {
          setAuthMode("update-password");
        }
      }
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) {
        return;
      }

      if (sessionError) {
        setAuthError(sessionError.message);
      }

      setUser(data.session?.user || null);
      setHistory(data.session?.user ? getStoredHistory(data.session.user.id) : []);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    if (!history.length) {
      return {
        completed: 0,
        averageScore: 0,
        recommendedMethod: "No data yet",
      };
    }

    const completed = history.length;
    const averageScore = (
      history.reduce((total, item) => total + item.recommendedScore, 0) / completed
    ).toFixed(1);
    const methodCounts = history.reduce((acc, item) => {
      const methodName = item.recommendedMethod || "No clear winner";
      acc[methodName] = (acc[methodName] || 0) + 1;
      return acc;
    }, {});
    const recommendedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data yet";

    return {
      completed,
      averageScore,
      recommendedMethod,
    };
  }, [history]);

  const comparisonSummary = useMemo(() => {
    if (firstMethodScore === null || assessmentScore === null) {
      return null;
    }

    if (firstMethodScore > assessmentScore) {
      return {
        winner: firstMethod,
        insight: `${firstMethod} performed better this round. The result suggests it helped you retain and apply the idea more effectively, but another session would strengthen the recommendation.`,
        delta: firstMethodScore - assessmentScore,
      };
    }

    if (assessmentScore > firstMethodScore) {
      return {
        winner: method,
        insight: `${method} performed better this round. It appears to have matched your learning needs more closely, though this is still an early signal and additional sessions would improve confidence.`,
        delta: assessmentScore - firstMethodScore,
      };
    }

    return {
      winner: "No clear winner",
      insight: "Both approaches produced the same score, so there is no clear winner yet. A few more sessions would be needed before Stride can recommend one method with confidence.",
      delta: 0,
    };
  }, [firstMethodScore, assessmentScore, firstMethod, method]);

  async function apiRequest(endpoint, payload) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error(sessionError?.message || "Please sign in again to continue.");
    }

    const isFormData = payload instanceof FormData;
    const requestBody = isFormData
      ? payload
      : JSON.stringify({
          ...payload,
          sourceMaterials: courseMaterials.map(({ name, text }) => ({ name, text })),
        });
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      method: "POST",
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        Authorization: `Bearer ${session.access_token}`,
      },
      body: requestBody,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Your request could not be completed.");
    }

    return data;
  }

  function openPanel(panel) {
    setActivePanel(panel);
    setStage("setup");
    setSidebarOpen(false);
    setError("");
    setMaterialMessage("");
  }

  async function uploadCourseMaterial(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (courseMaterials.length >= 5) {
      setMaterialMessage("You can add up to 5 course files. Remove one before adding another.");
      return;
    }
    if (courseMaterials.some((material) => material.name === file.name)) {
      setMaterialMessage("That file is already in your course library.");
      return;
    }

    setMaterialUploading(true);
    setMaterialMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const material = await apiRequest("/api/course-material", formData);
      const currentLength = courseMaterials.reduce((total, item) => total + item.text.length, 0);
      const availableCharacters = Math.max(0, 40000 - currentLength);
      if (!availableCharacters) {
        setMaterialMessage("Your course library has reached its context limit. Remove a file before adding another.");
        return;
      }

      const text = material.text.slice(0, availableCharacters);
      setCourseMaterials((previous) => [...previous, { name: material.name, text }]);
      setMaterialMessage(material.truncated || text.length < material.text.length
        ? `${material.name} was added. Stride will use the first section of the file as source material.`
        : `${material.name} is ready. New learning content will be based on this source.`);
    } catch (uploadError) {
      setMaterialMessage(uploadError.message || "Stride couldn't add that course file.");
    } finally {
      setMaterialUploading(false);
    }
  }

  async function generateTileImage(index) {
    const tile = lessonTiles[index];
    if (!tile) {
      return;
    }

    setImageLoadingIndex(index);
    setError("");
    try {
      const data = await apiRequest("/api/generate-image", { prompt: tile.visualPrompt });
      setLessonTiles((previous) => previous.map((item, tileIndex) => (
        tileIndex === index ? { ...item, imageUrl: data.imageUrl } : item
      )));
    } catch (imageError) {
      setError(imageError.message || "Stride couldn't create that picture.");
    } finally {
      setImageLoadingIndex(null);
    }
  }

  function beginLoading(title) {
    setLoadingTitle(title);
    setLoadingFact(getTopicFunFact(topic));
    setLoading(true);
    setError("");
    setStatusMessage("");
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthBusy(true);

    try {
      if (authMode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { full_name: authName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signupError) {
          throw signupError;
        }

        if (!data.session) {
          setAuthMessage("Check your inbox to confirm your email, then sign in to continue.");
        }
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (signinError) {
          throw signinError;
        }
      }
    } catch (authException) {
      setAuthError(authException.message || "We couldn't complete sign in.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signInWithGoogle() {
    setAuthError("");
    setAuthMessage("");
    setAuthBusy(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (authException) {
      setAuthError(authException.message || "Google sign-in couldn't be started.");
      setAuthBusy(false);
    }
  }

  async function sendPasswordReset() {
    if (!authEmail.trim()) {
      setAuthError("Enter your email address first so we know where to send the reset link.");
      return;
    }

    setAuthError("");
    setAuthMessage("");
    setAuthBusy(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
        redirectTo: window.location.origin,
      });

      if (resetError) {
        throw resetError;
      }

      setAuthMessage("If an account exists for that address, a password reset link is on its way.");
    } catch (authException) {
      setAuthError(authException.message || "We couldn't send a reset link.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthBusy(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        throw updateError;
      }

      setAuthMessage("Password updated successfully.");
      setAuthMode("password-updated");
      setNewPassword("");
    } catch (authException) {
      setAuthError(authException.message || "We couldn't update your password.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    setAuthError("");
    const { error: signoutError } = await supabase.auth.signOut();

    if (signoutError) {
      setAuthError(signoutError.message);
      return;
    }

    finalizeSession();
  }

  async function startDiagnostic(event) {
    event.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic before starting.");
      return;
    }

    beginLoading(`Mapping your ${topic} learning quest`);

    try {
      const [pathData, diagnosticData] = await Promise.all([
        apiRequest("/api/learning-path", { topic, level }),
        apiRequest("/api/diagnostic", { topic, level }),
      ]);
      const data = diagnosticData;
      setLearningPath(pathData);
      setLessonTiles([]);
      setVisitedTiles([]);
      setActiveTile(0);
      setQuestions(data.questions || []);
      setAnswers({});
      setDiagnosticScore(null);
      setStage("diagnostic");
      setStatusMessage(data.demoMode || pathData.demoMode
        ? "Demo content is active because live AI content was unavailable."
        : "Your topic roadmap and diagnostic are ready.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionIndex, optionIndex) {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
  }

  function submitDiagnostic(event) {
    event.preventDefault();

    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before continuing.");
      return;
    }

    const score = questions.reduce(
      (total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0),
      0
    );

    setDiagnosticScore(score);
    setError("");
    setStage("diagnostic-results");
  }

  async function generateLesson() {
    beginLoading(experimentRound === 1 ? "Building your first scroll-to-learn lesson" : "Switching up your learning approach");

    try {
      const data = await apiRequest("/api/lesson", {
        topic,
        level,
        method,
        diagnosticScore,
        experimentRound,
        learningPath,
      });

      if (!Array.isArray(data.tiles) || data.tiles.length < 1) {
        throw new Error("Stride couldn't build the lesson tiles. Please try again.");
      }

      setLessonTiles(data.tiles);
      setVisitedTiles([0]);
      setActiveTile(0);
      setStage("lesson");
      setStatusMessage(data.demoMode ? "Demo lesson tiles are shown because the live AI service was unavailable." : "Your interactive lesson is ready. Scroll to explore each idea.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateAssessment(isRetry = false) {
    const attempt = isRetry || (experimentRound === 2 && assessmentAttempt > 1)
      ? assessmentAttempt + 1
      : 1;
    setAssessmentAttempt(attempt);
    beginLoading(isRetry ? "Making you a fresh challenge" : "Preparing your knowledge quest");

    try {
      const data = await apiRequest("/api/assessment", {
        topic,
        level,
        method,
        experimentRound,
        attempt,
        learningPath,
      });
      if (!data.assessmentId || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error("Stride couldn't prepare your assessment. Please try again.");
      }
      setAssessmentId(data.assessmentId);
      setAssessmentQuestions(data.questions);
      setAssessmentAnswers({});
      setAssessmentScore(null);
      setAssessmentMaxScore(data.questions.reduce(
        (total, question) => total + (question.type === "short-answer" ? 3 : 1),
        0
      ));
      setStage("assessment");
      setStatusMessage(data.demoMode ? "Demo assessment questions are shown because live AI content was unavailable." : `Challenge ${attempt} is ready.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function recordVisitedTile(index) {
    setActiveTile(index);
    setVisitedTiles((previous) => previous.includes(index) ? previous : [...previous, index]);
  }

  function handleLessonScroll(event) {
    const container = event.currentTarget;
    const cards = Array.from(container.querySelectorAll(".knowledge-tile"));

    if (!cards.length) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const nearestIndex = cards.reduce((nearest, card, index) => {
      const currentDistance = Math.abs(card.getBoundingClientRect().top - containerTop);
      const nearestDistance = Math.abs(cards[nearest].getBoundingClientRect().top - containerTop);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);

    recordVisitedTile(nearestIndex);
  }

  function scrollToTile(index) {
    const card = lessonScrollerRef.current?.querySelectorAll(".knowledge-tile")[index];
    if (!card || !lessonScrollerRef.current) {
      return;
    }

    lessonScrollerRef.current.scrollTo({
      top: card.offsetTop,
      behavior: "smooth",
    });
    recordVisitedTile(index);
  }

  async function submitAssessment(event) {
    event.preventDefault();

    const everyAnswerProvided = assessmentQuestions.every((question, index) => (
      question.type === "short-answer"
        ? typeof assessmentAnswers[index] === "string" && assessmentAnswers[index].trim()
        : Number.isInteger(assessmentAnswers[index])
    ));
    if (!everyAnswerProvided) {
      setError("Please answer every question before submitting your assessment.");
      return;
    }

    beginLoading("Checking your answers and written explanations");
    setError("");
    try {
      const result = await apiRequest("/api/grade-assessment", {
        assessmentId,
        answers: assessmentAnswers,
      });
      const { score, maxScore } = result;
      const feedback = assessmentQuestions.flatMap((question, index) => (
        question.type === "short-answer"
          ? [{ question: question.question, ...result.grades[index] }]
          : []
      ));
      setWrittenFeedback(feedback);
      setAssessmentScore(score);
      setAssessmentMaxScore(maxScore);
      if (result.gradingMode === "sample-rubric") {
        setStatusMessage("Written responses were checked with a sample rubric because the AI grader was unavailable.");
      } else {
        setStatusMessage("");
      }

      if (experimentRound === 1) {
        setFirstMethodScore(score);
        setFirstMethodMaxScore(maxScore);
        setFirstWrittenFeedback(feedback);
        setFirstMethod(method);
        setExperimentRound(2);
        setStage("second-method");
        return;
      }

      const passScore = Math.ceil(maxScore * PASS_MARK);
      if (maxScore && score < passScore) {
        setStatusMessage(`You scored ${score} of ${maxScore} points. You need ${passScore} points (${Math.round(PASS_MARK * 100)}%) to complete this level. You can try a fresh challenge.`);
        setStage("final-assessment-failed");
        return;
      }

      const nextMethod = METHOD_OPTIONS.find((option) => option !== firstMethod) || "Analogies and storytelling";
      const recommendedMethod =
        firstMethodScore > score ? firstMethod : score > firstMethodScore ? method : "No clear winner";
      const comparisonInsight =
        firstMethodScore > score
          ? `${firstMethod} performed better this round. The result suggests it helped you retain and apply the idea more effectively, but another session would strengthen the recommendation.`
          : score > firstMethodScore
            ? `${method} performed better this round. It appears to have matched your learning needs more closely, though this is still an early signal and additional sessions would improve confidence.`
            : "Both approaches produced the same score, so there is no clear winner yet. A few more sessions would be needed before Stride can recommend one method with confidence.";

      const entry = {
        id: `${Date.now()}`,
        topic,
        level,
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        firstMethod,
        firstMethodScore,
        firstMethodMaxScore,
        secondMethod: method,
        secondMethodScore: score,
        secondMethodMaxScore: maxScore,
        recommendedMethod,
        recommendedScore: Math.max(firstMethodScore, score),
        note: comparisonInsight,
        comparisonMethod: nextMethod,
        scopeSummary: learningPath?.scopeSummary || "",
        badge: `${learningPath?.levelTitle || level} Explorer`,
        passed: true,
      };

      const updatedHistory = [entry, ...getStoredHistory(user.id)].slice(0, 6);
      localStorage.setItem(`${STORAGE_KEY}:${user.id}`, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setStage("comparison");
    } catch (gradeError) {
      setError(gradeError.message || "Stride couldn't grade your answers.");
    } finally {
      setLoading(false);
    }
  }

  function startSecondMethod() {
    const nextMethod = METHOD_OPTIONS.find((option) => option !== firstMethod) || "Analogies and storytelling";
    setMethod(nextMethod);
    setExperimentRound(2);
    setStage("generate-second-lesson");
  }

  function finalizeSession() {
    setStage("setup");
    setActivePanel("home");
    setTopic("Geographic Information Systems");
    setLevel("University");
    setMethod("Worked examples");
    setQuestions([]);
    setAnswers({});
    setDiagnosticScore(null);
    setAssessmentScore(null);
    setAssessmentMaxScore(0);
    setFirstMethodMaxScore(0);
    setWrittenFeedback([]);
    setFirstWrittenFeedback([]);
    setAssessmentAnswers({});
    setAssessmentQuestions([]);
    setAssessmentId("");
    setFirstMethodScore(null);
    setFirstMethod("");
    setExperimentRound(1);
    setLessonTiles([]);
    setLearningPath(null);
    setVisitedTiles([]);
    setActiveTile(0);
    setAssessmentAttempt(1);
    setError("");
    setStatusMessage("");
  }

  if (isSupabaseConfigured && authLoading) {
    return (
      <div className="auth-check" role="status" aria-live="polite">
        <div className="auth-check-mark">s<span>.</span></div>
        <p>Getting your learning space ready…</p>
        <div className="auth-check-bar"><span /></div>
      </div>
    );
  }

  if (!user) {
    const isSignup = authMode === "signup";
    const isReset = authMode === "reset";

    return (
      <div className="app-shell auth-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-mark">stride<span>.</span></div>
            <span className="topbar-label">Your personal AI learning coach</span>
          </div>
        </header>
        <main className="auth-page">
          <section className="auth-card">
            <div className="auth-visual" aria-hidden="true">
              <span className="auth-spark spark-one">✦</span>
              <span className="auth-spark spark-two">✧</span>
              <div className="auth-orbit"><span /><span /><span /></div>
              <div className="auth-book">📚</div>
              <div className="auth-visual-caption">Curiosity looks good on you.</div>
            </div>

            <div className="auth-content">
              <span className="eyebrow">{isReset ? "ACCOUNT RECOVERY" : "YOUR LEARNING ADVENTURE STARTS HERE"}</span>
              <h1>{isReset ? "Reset your password." : isSignup ? "Create your learning space." : "Welcome back, learner."}</h1>
              <p className="auth-description">
                {isReset
                  ? "We’ll send you a secure link to choose a new password."
                  : "Sign in to save your experiments and pick up right where you left off."}
              </p>

              {!isSupabaseConfigured && (
                <div className="auth-config-note" role="alert">
                  <strong>One quick setup step</strong>
                  <span>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the project’s root <code>.env</code>, then restart Vite.</span>
                  <span>For Google sign-in, enable the Google provider in your Supabase Auth settings and add this site URL to the allowed redirects.</span>
                </div>
              )}

              {!isReset && (
                <>
                  <button
                    type="button"
                    className="google-button"
                    onClick={signInWithGoogle}
                    disabled={!isSupabaseConfigured || authBusy}
                  >
                    <span className="google-g" aria-hidden="true">G</span>
                    Continue with Google
                  </button>
                  <div className="auth-divider"><span>or use email</span></div>
                </>
              )}

              <form className="auth-form" onSubmit={isReset ? (event) => { event.preventDefault(); sendPasswordReset(); } : submitAuth}>
                {isSignup && (
                  <label className="field-group">
                    <span>Your name</span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={authName}
                      onChange={(event) => setAuthName(event.target.value)}
                      placeholder="How should we call you?"
                      required
                      disabled={!isSupabaseConfigured || authBusy}
                    />
                  </label>
                )}
                <label className="field-group">
                  <span>Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={!isSupabaseConfigured || authBusy}
                  />
                </label>
                {!isReset && (
                  <label className="field-group">
                    <span>Password</span>
                    <input
                      type="password"
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      placeholder={isSignup ? "At least 8 characters" : "Your password"}
                      minLength={isSignup ? 8 : undefined}
                      required
                      disabled={!isSupabaseConfigured || authBusy}
                    />
                  </label>
                )}

                {authError && <p className="error-message" role="alert">{authError}</p>}
                {authMessage && <p className="status-message" role="status">{authMessage}</p>}

                <button className="primary auth-submit" type="submit" disabled={!isSupabaseConfigured || authBusy}>
                  {authBusy
                    ? "One moment…"
                    : isReset
                      ? "Send reset link"
                      : isSignup
                        ? "Create my account"
                        : "Sign in"}
                </button>
              </form>

              {authMode === "signin" && (
                <button
                  type="button"
                  className="text-button forgot-button"
                  onClick={() => { setAuthMode("reset"); setAuthError(""); setAuthMessage(""); }}
                  disabled={!isSupabaseConfigured || authBusy}
                >
                  Forgot your password?
                </button>
              )}
              <p className="auth-switch">
                {isReset ? (
                  <button type="button" className="text-button" onClick={() => { setAuthMode("signin"); setAuthError(""); setAuthMessage(""); }}>
                    Back to sign in
                  </button>
                ) : (
                  <>
                    {isSignup ? "Already have an account?" : "New to Stride?"}{" "}
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => { setAuthMode(isSignup ? "signin" : "signup"); setAuthError(""); setAuthMessage(""); }}
                    >
                      {isSignup ? "Sign in" : "Create an account"}
                    </button>
                  </>
                )}
              </p>
              <p className="auth-privacy">Your learning history is saved to this browser and kept separate for each signed-in account.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (authMode === "update-password" || authMode === "password-updated") {
    const passwordUpdated = authMode === "password-updated";

    return (
      <div className="app-shell auth-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-mark">stride<span>.</span></div>
            <span className="topbar-label">Your personal AI learning coach</span>
          </div>
        </header>
        <main className="auth-page">
          <section className="auth-card password-reset-card">
            <div className="auth-visual" aria-hidden="true">
              <span className="auth-spark spark-one">✦</span>
              <span className="auth-spark spark-two">✧</span>
              <div className="auth-orbit"><span /><span /><span /></div>
              <div className="auth-book">🔐</div>
              <div className="auth-visual-caption">Fresh start, same curiosity.</div>
            </div>
            <div className="auth-content">
              <span className="eyebrow">ACCOUNT RECOVERY</span>
              <h1>{passwordUpdated ? "You’re all set." : "Choose a new password."}</h1>
              <p className="auth-description">
                {passwordUpdated
                  ? "Your password has been updated. Your learning space is ready."
                  : "Make it at least 8 characters long so your account stays secure."}
              </p>
              {authError && <p className="error-message" role="alert">{authError}</p>}
              {authMessage && <p className="status-message" role="status">{authMessage}</p>}
              {passwordUpdated ? (
                <button type="button" className="primary auth-submit" onClick={() => setAuthMode("signin")}>
                  Continue to Stride
                </button>
              ) : (
                <form className="auth-form" onSubmit={updatePassword}>
                  <label className="field-group">
                    <span>New password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      minLength={8}
                      required
                      disabled={authBusy}
                    />
                  </label>
                  <button className="primary auth-submit" type="submit" disabled={authBusy}>
                    {authBusy ? "Updating password…" : "Update password"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close learning menu" : "Open learning menu"}
            aria-expanded={sidebarOpen}
            aria-controls="learning-sidebar"
          >
            <span aria-hidden="true">{sidebarOpen ? "×" : "☰"}</span>
          </button>
          <div className="brand-mark">stride<span>.</span></div>
          <div className="account-controls">
            <span className="topbar-label">{user.user_metadata?.full_name || user.email}</span>
            <button type="button" className="signout-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close learning menu"
        />
      )}
      <aside
        id="learning-sidebar"
        className={`learning-sidebar${sidebarOpen ? " open" : ""}`}
        aria-label="Learning options"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
      >
        <div className="sidebar-heading">
          <span className="eyebrow">YOUR SPACE</span>
          <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="sidebar-nav">
          <button type="button" className={activePanel === "home" ? "selected" : ""} onClick={() => openPanel("home")}><span>🏠</span> Learning home</button>
          <button type="button" className={activePanel === "materials" ? "selected" : ""} onClick={() => openPanel("materials")}><span>📚</span> Course materials <b>{courseMaterials.length}</b></button>
          <button type="button" className={activePanel === "progress" ? "selected" : ""} onClick={() => openPanel("progress")}><span>🏅</span> Progress & badges</button>
          <button type="button" className={activePanel === "preferences" ? "selected" : ""} onClick={() => openPanel("preferences")}><span>✨</span> Learning preferences</button>
        </nav>
        <div className="sidebar-tip">
          <span>💡</span>
          <p>Upload your class notes so each learning quest can stick to what you are studying.</p>
        </div>
      </aside>

      <main className="main-content">
        {stage === "setup" && activePanel === "home" && (
          <>
            <section className="hero-panel card">
              <div className="hero-copy">
                <span className="eyebrow">LEARN BETTER. YOUR WAY.</span>
                <h1>Discover how you learn best.</h1>
                <p>
                  Stride compares teaching strategies, measures learning gains, and recommends the approach that helps you learn more effectively.
                </p>
                <div className="mini-actions">
                  <button type="button" className="primary" onClick={() => setStage("setup")}>Start learning</button>
                  <button type="button" className="secondary" onClick={() => setTopic("Geographic Information Systems")}>Load demo topic</button>
                </div>
              </div>

              <LearningIllustration />
            </section>

            <section className="experiment-strip">
              <span className="strip-label">YOUR LEARNING QUEST</span>
              <div className="quest-steps">
                <span><b>01</b> Find your baseline</span>
                <i aria-hidden="true">→</i>
                <span><b>02</b> Learn a new way</span>
                <i aria-hidden="true">→</i>
                <span><b>03</b> Compare & level up</span>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="card form-card">
                <h2>What do you want to learn?</h2>
                <p className="card-subtitle">Choose a topic and begin a focused learning experiment.</p>

                <form onSubmit={startDiagnostic} className="form-stack">
                  <div className="field-group">
                    <label htmlFor="topic">Topic</label>
                    <input
                      id="topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="e.g. Geographic Information Systems"
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="level">Education level</label>
                    <select id="level" value={level} onChange={(event) => setLevel(event.target.value)}>
                      <option>Secondary School</option>
                      <option>University</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>

                  <div className="topic-pills" aria-label="Suggested topics">
                    {SAMPLE_TOPICS.map((sampleTopic) => (
                      <button
                        key={sampleTopic}
                        type="button"
                        className="topic-pill"
                        onClick={() => setTopic(sampleTopic)}
                      >
                        {sampleTopic}
                      </button>
                    ))}
                  </div>

                  {error && <p className="error-message">{error}</p>}
                  {statusMessage && <p className="status-message">{statusMessage}</p>}

                  <button type="submit" className="primary" disabled={loading}>
                    {loading ? "Preparing diagnostic..." : "Start learning"}
                  </button>
                </form>
              </div>

              <aside className="card stats-card">
                <h3>Learning dashboard</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Experiments</span>
                    <strong>{stats.completed}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average score</span>
                    <strong>{stats.averageScore || "0.0"}</strong>
                  </div>
                  <div className="stat-item full-width">
                    <span className="stat-label">Top recommended method</span>
                    <strong>{stats.recommendedMethod}</strong>
                  </div>
                </div>

                <div className="history-stack">
                  <h4>Recent activity</h4>
                  {history.length ? (
                    history.slice(0, 3).map((item) => (
                      <div key={item.id} className="history-item">
                        <div>
                          <strong>{item.topic}</strong>
                          <span>{item.date}</span>
                          {item.badge && <span className="history-badge">🏅 {item.badge}</span>}
                        </div>
                        <div className="history-meta">
                          <span>{item.firstMethod}: {item.firstMethodScore}</span>
                          <span>{item.secondMethod}: {item.secondMethodScore}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No completed sessions yet.</p>
                      <span>Start your first learning experiment to build a history.</span>
                    </div>
                  )}
                </div>
              </aside>
            </section>
          </>
        )}

        {stage === "setup" && activePanel === "materials" && (
          <section className="card learning-card materials-panel">
            <span className="eyebrow">YOUR COURSE SHELF</span>
            <h1>Learn from your class materials.</h1>
            <p className="lead-text">Add notes or course handouts. Stride will use them to shape your topic map, lesson tiles, and questions instead of relying only on general knowledge.</p>
            <label className="material-upload">
              <span className="material-upload-icon" aria-hidden="true">＋</span>
              <strong>{materialUploading ? "Reading your file…" : "Add course material"}</strong>
              <span>PDF, DOCX, TXT, or Markdown · up to 10 MB per file</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                onChange={uploadCourseMaterial}
                disabled={materialUploading || courseMaterials.length >= 5}
              />
            </label>
            <p className="material-privacy-note">Extracted text is sent to Meta AI to tailor this session. Stride does not save the original file.</p>
            {materialMessage && <p className="status-message" role="status">{materialMessage}</p>}
            <div className="materials-list">
              <h2>Added materials <span>{courseMaterials.length} / 5</span></h2>
              {courseMaterials.length ? courseMaterials.map((material, index) => (
                <div className="material-row" key={`${material.name}-${index}`}>
                  <span className="material-file-icon" aria-hidden="true">📄</span>
                  <div><strong>{material.name}</strong><span>{material.text.length.toLocaleString()} characters ready for learning</span></div>
                  <button
                    type="button"
                    className="material-remove"
                    onClick={() => {
                      setCourseMaterials((previous) => previous.filter((_, materialIndex) => materialIndex !== index));
                      setMaterialMessage(`${material.name} was removed from your course shelf.`);
                    }}
                    aria-label={`Remove ${material.name}`}
                  >Remove</button>
                </div>
              )) : (
                <p className="empty-state">Your shelf is empty. Add a course file to make your next learning quest more specific.</p>
              )}
            </div>
          </section>
        )}

        {stage === "setup" && activePanel === "progress" && (
          <section className="card learning-card">
            <span className="eyebrow">YOUR LEARNING JOURNEY</span>
            <h1>Progress & badges</h1>
            <p className="lead-text">Your completed experiments and level badges are saved to this browser account.</p>
            <div className="progress-summary-cards">
              <div><span>Completed quests</span><strong>{stats.completed}</strong></div>
              <div><span>Average score</span><strong>{stats.averageScore}</strong></div>
              <div><span>Recommended approach</span><strong>{stats.recommendedMethod}</strong></div>
            </div>
            <div className="history-stack progress-history">
              <h2>Completed learning quests</h2>
              {history.length ? history.map((item) => (
                <article className="progress-history-item" key={item.id}>
                  <span className="progress-history-badge" aria-hidden="true">🏅</span>
                  <div><strong>{item.badge || `${item.level} Explorer`}</strong><span>{item.topic} · {item.date}</span><small>{item.scopeSummary}</small></div>
                  <span className="history-score">{item.secondMethodScore} points</span>
                </article>
              )) : <p className="empty-state">Finish your first learning quest to earn a badge and see your progress here.</p>}
            </div>
          </section>
        )}

        {stage === "setup" && activePanel === "preferences" && (
          <section className="card learning-card">
            <span className="eyebrow">MAKE IT YOURS</span>
            <h1>Learning preferences</h1>
            <p className="lead-text">Choose a starting style and education level. You can still change your teaching approach before each lesson.</p>
            <div className="preference-fields">
              <div className="field-group">
                <label htmlFor="preferred-method">Preferred teaching approach</label>
                <select id="preferred-method" value={method} onChange={(event) => setMethod(event.target.value)}>
                  {METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="preferred-level">Education level</label>
                <select id="preferred-level" value={level} onChange={(event) => setLevel(event.target.value)}>
                  <option>Secondary School</option>
                  <option>University</option>
                  <option>Postgraduate</option>
                </select>
              </div>
            </div>
            <button type="button" className="primary" onClick={() => openPanel("home")}>Save preferences</button>
          </section>
        )}

        {stage === "diagnostic" && (
          <section className="card learning-card">
            <span className="eyebrow">STEP 1 OF 3 · DIAGNOSTIC</span>
            <h1>Let’s see what you already know.</h1>
            <p className="lead-text">
              Answer these questions about <strong>{topic}</strong> to establish your baseline before the learning experiment begins.
            </p>

            <TopicProgress path={learningPath} />

            <form onSubmit={submitDiagnostic} className="question-form">
              {questions.map((question, index) => (
                <div className="question-card" key={index}>
                  <div className="progress-row">
                    <span>Question {index + 1}</span>
                    <span>{index + 1}/{questions.length}</span>
                  </div>
                  <h3>{question.question}</h3>

                  <div className="option-list">
                    {question.options.map((option, optionIndex) => (
                      <label className="option-item" key={optionIndex}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={answers[index] === optionIndex}
                          onChange={() => selectAnswer(index, optionIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {error && <p className="error-message">{error}</p>}
              {statusMessage && <p className="status-message">{statusMessage}</p>}

              <button type="submit" className="primary">Submit diagnostic</button>
            </form>
          </section>
        )}

        {stage === "diagnostic-results" && (
          <section className="card learning-card">
            <span className="eyebrow">DIAGNOSTIC COMPLETE</span>
            <h1>Your starting point</h1>
            <p className="lead-text">
              You scored <strong>{diagnosticScore}</strong> out of <strong>{questions.length}</strong>.
            </p>
            <p className="lead-text">
              Choose the first teaching strategy you want Stride to use, then compare it with a second approach after the next assessment.
            </p>

            <div className="field-group compact">
              <label htmlFor="method">Teaching approach</label>
              <select id="method" value={method} onChange={(event) => setMethod(event.target.value)}>
                {METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}
            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <button type="button" className="primary" onClick={generateLesson} disabled={loading}>
              {loading ? "Stride is preparing your lesson..." : "Generate my lesson"}
            </button>
          </section>
        )}

        {stage === "generate-second-lesson" && (
          <section className="card learning-card">
            <span className="eyebrow">LEARNING EXPERIMENT · ROUND 2</span>
            <h1>A different way to understand {topic}.</h1>
            <p className="lead-text">
              Stride is shifting to <strong>{method}</strong> so you can compare how this teaching style affects your understanding.
            </p>

            {error && <p className="error-message">{error}</p>}
            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <button type="button" className="primary" onClick={generateLesson} disabled={loading}>
              {loading ? "Preparing your lesson..." : "Generate second lesson"}
            </button>
          </section>
        )}

        {stage === "lesson" && (
          <section className="card learning-card lesson-card">
            <span className="eyebrow">SCROLL TO LEARN · ROUND {experimentRound}</span>
            <h1>{topic}</h1>
            <p className="lead-text">
              Teaching approach: <strong>{method}</strong>. Scroll, swipe, or tap through the idea tiles.
            </p>

            <TopicProgress path={learningPath} completedTiles={visitedTiles} />

            <div
              className="lesson-scroller"
              ref={lessonScrollerRef}
              onScroll={handleLessonScroll}
              aria-label="Scrollable learning tiles"
              tabIndex={0}
            >
              {lessonTiles.map((tile, index) => (
                <article className="knowledge-tile" key={`${tile.title}-${index}`}>
                  <div className="tile-topline">
                    <span className="tile-number">IDEA {String(index + 1).padStart(2, "0")}</span>
                    <span className="tile-step">{index + 1} / {lessonTiles.length}</span>
                  </div>
                  {tile.imageUrl ? (
                    <img className="tile-generated-image" src={tile.imageUrl} alt={`Illustration: ${tile.title}`} />
                  ) : (
                    <div className="tile-visual" aria-hidden="true">{tile.emoji || "💡"}</div>
                  )}
                  <button
                    type="button"
                    className="tile-image-button"
                    onClick={() => generateTileImage(index)}
                    disabled={imageLoadingIndex !== null}
                  >
                    {imageLoadingIndex === index ? "Creating your picture…" : tile.imageUrl ? "Create a new picture" : "Make a picture for this idea"}
                  </button>
                  <h2>{tile.title}</h2>
                  <p className="tile-explanation">{tile.explanation}</p>
                  {tile.example && (
                    <div className="tile-example">
                      <span>REAL-WORLD SPARK</span>
                      <p>{tile.example}</p>
                    </div>
                  )}
                  {tile.challenge && (
                    <div className="tile-challenge">
                      <span>YOUR TURN</span>
                      <p>{tile.challenge}</p>
                    </div>
                  )}
                  {tile.takeaway && <p className="tile-takeaway"><strong>Keep this:</strong> {tile.takeaway}</p>}
                  <button
                    type="button"
                    className="tile-next"
                    onClick={() => index < lessonTiles.length - 1 ? scrollToTile(index + 1) : recordVisitedTile(index)}
                  >
                    {index < lessonTiles.length - 1 ? "Got it — next idea ↓" : "Finish this learning level ✓"}
                  </button>
                </article>
              ))}
            </div>

            <div className="tile-progress-line">
              <span>Idea {activeTile + 1} of {lessonTiles.length} · {visitedTiles.length} explored</span>
              <span>Keep scrolling to unlock your challenge</span>
            </div>

            {error && <p className="error-message">{error}</p>}
            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <button
              type="button"
              className="primary"
              onClick={generateAssessment}
              disabled={loading || visitedTiles.length < lessonTiles.length}
            >
              {visitedTiles.length < lessonTiles.length ? "Explore every tile to unlock the challenge" : "I’m ready for the challenge"}
            </button>
          </section>
        )}

        {stage === "assessment" && (
          <section className="card learning-card">
            <span className="eyebrow">{experimentRound === 2 ? "FINAL LEVEL CHALLENGE" : "KNOWLEDGE CHECK"} · ATTEMPT {assessmentAttempt}</span>
            <h1>Let’s test what you’ve learned.</h1>
            <p className="lead-text">Answer these questions without looking back at your lesson.</p>
            {experimentRound === 2 && (
              <div className="pass-mark-banner">
                <span>🏁</span>
                <p><strong>Level pass mark: 80%</strong><br />Written answers earn up to 2 points. Get at least {Math.ceil(assessmentMaxScore * PASS_MARK)} of {assessmentMaxScore} points to earn your badge.</p>
              </div>
            )}

            <form onSubmit={submitAssessment} className="question-form">
              {assessmentQuestions.map((question, index) => (
                <div className="question-card" key={index}>
                  <div className="progress-row">
                    <span>Question {index + 1}</span>
                    <span>{question.type === "short-answer" ? "THEORY · UP TO 3 POINTS" : "MULTIPLE CHOICE"}</span>
                  </div>
                  <h3>{question.question}</h3>

                  {question.type === "short-answer" ? (
                    <label className="written-answer">
                      <span>Explain it in your own words</span>
                      <textarea
                        rows={4}
                        value={assessmentAnswers[index] || ""}
                        onChange={(event) => setAssessmentAnswers((previous) => ({
                          ...previous,
                          [index]: event.target.value,
                        }))}
                        placeholder="Share your reasoning, and add an example if you can…"
                        required
                      />
                    </label>
                  ) : (
                    <div className="option-list">
                      {question.options.map((option, optionIndex) => (
                        <label className="option-item" key={optionIndex}>
                          <input
                            type="radio"
                            name={`assessment-${index}`}
                            checked={assessmentAnswers[index] === optionIndex}
                            onChange={() =>
                              setAssessmentAnswers((previous) => ({
                                ...previous,
                                [index]: optionIndex,
                              }))
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {error && <p className="error-message">{error}</p>}
              {statusMessage && <p className="status-message">{statusMessage}</p>}

              <button type="submit" className="primary" disabled={loading}>Submit assessment</button>
            </form>
          </section>
        )}

        {stage === "final-assessment-failed" && (
          <section className="card learning-card pass-result-card">
            <span className="eyebrow">ONE MORE TRY</span>
            <div className="result-emoji" aria-hidden="true">🧩</div>
            <h1>You’re still building this level.</h1>
            <p className="lead-text">
              You scored <strong>{assessmentScore} / {assessmentMaxScore} points</strong>. The pass mark is <strong>{Math.ceil(assessmentMaxScore * PASS_MARK)} / {assessmentMaxScore} points (80%)</strong>.
            </p>
            <p className="lead-text">That’s progress, not a setback. Review the topic tiles if you like, then try a fresh set of questions. Your level badge is waiting.</p>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
            {writtenFeedback.length > 0 && (
              <div className="written-feedback">
                <h3>Notes on your theory answers</h3>
                {writtenFeedback.map((item, index) => (
                  <article key={`${item.question}-${index}`}>
                    <strong>{item.score} / {item.maxScore} points</strong>
                    <p>{item.feedback}</p>
                  </article>
                ))}
              </div>
            )}
            <div className="cta-row">
              <button type="button" className="primary" onClick={() => generateAssessment(true)} disabled={loading}>Try a fresh challenge</button>
              <button type="button" className="secondary" onClick={() => setStage("lesson")}>Revisit the learning tiles</button>
            </div>
          </section>
        )}

        {stage === "second-method" && (
          <section className="card learning-card">
            <span className="eyebrow">LEARNING EXPERIMENT · ROUND 2</span>
            <h1>Let’s try another approach.</h1>
            <p className="lead-text">
              Your first assessment score was <strong>{firstMethodScore}</strong> out of <strong>{firstMethodMaxScore} points</strong>.
            </p>
            <p className="lead-text">Now Stride will compare that result with a second teaching strategy on the same topic.</p>
            {firstWrittenFeedback.length > 0 && (
              <div className="written-feedback">
                <h3>Notes on your theory answers</h3>
                {firstWrittenFeedback.map((item, index) => (
                  <article key={`${item.question}-${index}`}>
                    <strong>{item.score} / {item.maxScore} points</strong>
                    <p>{item.feedback}</p>
                  </article>
                ))}
              </div>
            )}

            <button type="button" className="primary" onClick={startSecondMethod}>Try the second approach</button>
          </section>
        )}

        {stage === "comparison" && (
          <section className="card learning-card comparison-panel">
            <span className="eyebrow">YOUR LEARNING REPORT</span>
            <h1>Here’s what we discovered.</h1>

            <div className="earned-badge">
              <span className="earned-badge-icon" aria-hidden="true">🏅</span>
              <div>
                <span>LEVEL COMPLETE · {Math.round(PASS_MARK * 100)}% PASS MARK MET</span>
                <strong>{learningPath?.levelTitle || level} Explorer</strong>
                <p>{assessmentScore} / {assessmentMaxScore} points on the final challenge · {learningPath?.scopeSummary}</p>
              </div>
            </div>

            <TopicProgress
              path={learningPath}
              completedTiles={(learningPath?.milestones || []).map((milestone, index) => milestone.title && index)}
            />

            <div className="comparison-grid">
              <div className="score-card">
                <span className="score-label">Round 1: {firstMethod}</span>
                <strong>{firstMethodScore} / {firstMethodMaxScore}</strong>
                <div className="bar-track">
                  <span style={{ width: `${(firstMethodScore / (firstMethodMaxScore || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="score-card highlight">
                <span className="score-label">Round 2: {method}</span>
                <strong>{assessmentScore} / {assessmentMaxScore}</strong>
                <div className="bar-track">
                  <span style={{ width: `${(assessmentScore / (assessmentMaxScore || 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="insight-box">
              <h3>{comparisonSummary?.winner === "No clear winner" ? "No clear winner" : `${comparisonSummary?.winner} performed best`}</h3>
              <p>{comparisonSummary?.insight}</p>
            </div>

            <p className="lead-text">
              Baseline score: <strong>{diagnosticScore}</strong> / <strong>{questions.length}</strong>
            </p>
            {writtenFeedback.length > 0 && (
              <div className="written-feedback">
                <h3>Notes on your final theory answers</h3>
                {writtenFeedback.map((item, index) => (
                  <article key={`${item.question}-${index}`}>
                    <strong>{item.score} / {item.maxScore} points</strong>
                    <p>{item.feedback}</p>
                  </article>
                ))}
              </div>
            )}

            <div className="cta-row">
              <button type="button" className="primary" onClick={finalizeSession}>Start a new experiment</button>
              <button type="button" className="secondary" onClick={finalizeSession}>Return to dashboard</button>
            </div>
          </section>
        )}
      </main>
      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-card">
            <div className="loading-orbit" aria-hidden="true">
              <span className="orbit-dot dot-a">✦</span>
              <span className="orbit-dot dot-b">●</span>
              <span className="orbit-dot dot-c">✧</span>
              <div className="loading-book">📚</div>
            </div>
            <span className="loading-kicker">STRIDE IS ON IT</span>
            <p className="loading-task">{loadingTitle}</p>
            <div className="loading-fact">
              <span>FUN FACT WHILE YOU WAIT</span>
              <p>{loadingFact}</p>
            </div>
            <div className="loading-track"><span /></div>
            <div className="loading-dots" aria-hidden="true"><i /><i /><i /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;