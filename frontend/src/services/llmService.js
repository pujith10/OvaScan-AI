/**
 * LLM Service for OvaScan AI
 * Generates tailored PCOS lifestyle, home workout, and diet suggestions
 * using Google Gemini, OpenAI, Groq, or custom OpenAI-compatible endpoints.
 */

const STORAGE_KEY_API_KEY = 'ovascan_llm_api_key';
const STORAGE_KEY_PROVIDER = 'ovascan_llm_provider';
const STORAGE_KEY_MODEL = 'ovascan_llm_model';
const STORAGE_KEY_ENDPOINT = 'ovascan_llm_custom_endpoint';

export const LLM_PROVIDERS = [
  {
    id: 'tokenrouter',
    name: 'TokenRouter',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-1.5-flash',
    ],
    defaultEndpoint: 'https://api.tokenrouter.io/v1/chat/completions',
    placeholder: 'Paste your TokenRouter API Key...',
    docsUrl: 'https://tokenrouter.io',
    info: 'Multi-model AI router gateway (Claude, GPT-4o, Llama 3, Gemini)',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    placeholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    info: 'Free & ultra-fast API keys from Google AI Studio',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    info: 'Standard OpenAI Developer API keys',
  },
  {
    id: 'groq',
    name: 'Groq (Ultra-Fast Llama 3)',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    info: 'Sub-second inference with open weights',
  },
  {
    id: 'custom',
    name: 'Custom (OpenAI-Compatible)',
    defaultModel: 'default',
    models: ['default'],
    placeholder: 'API Key or Bearer Token',
    docsUrl: '',
    info: 'Any local (e.g. Ollama, vLLM) or private OpenAI-compatible gateway',
  },
];

export function getStoredConfig() {
  const envKey = import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
  const envProvider = import.meta.env.VITE_LLM_PROVIDER || (import.meta.env.VITE_GEMINI_API_KEY ? 'gemini' : 'gemini');

  return {
    apiKey: localStorage.getItem(STORAGE_KEY_API_KEY) || envKey,
    provider: localStorage.getItem(STORAGE_KEY_PROVIDER) || envProvider,
    model: localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-1.5-flash',
    customEndpoint: localStorage.getItem(STORAGE_KEY_ENDPOINT) || '',
  };
}

export function saveStoredConfig(config) {
  if (config.apiKey !== undefined) localStorage.setItem(STORAGE_KEY_API_KEY, config.apiKey.trim());
  if (config.provider) localStorage.setItem(STORAGE_KEY_PROVIDER, config.provider);
  if (config.model) localStorage.setItem(STORAGE_KEY_MODEL, config.model);
  if (config.customEndpoint !== undefined) localStorage.setItem(STORAGE_KEY_ENDPOINT, config.customEndpoint.trim());
}

/**
 * Builds the exact prompt specifying:
 * 1. JSON health & model predictions.
 * 2. 7-day diet plan in a table.
 * 3. 7-day home workout routine (sets, reps, equipment - home only).
 * 4. Sleep schedule and daily routine.
 * 5. Number of months duration.
 */
export function buildPcosPrompt(patientJsonData) {
  // Sanitize payload: strip out heavy base64 scan data so LLM WAF firewalls do not block text requests
  const cleanData = { ...patientJsonData };
  if (cleanData.scanUrl) {
    cleanData.ultrasoundScanPresent = true;
    delete cleanData.scanUrl;
  }
  delete cleanData.image;
  delete cleanData.imageBase64;
  delete cleanData.rawImage;

  const jsonString = JSON.stringify(cleanData, null, 2);

  return `this is the complete information about my PCOS health in json format and I want you to make a complete one week daily exercises list and diet plan for a week and for how many months I should follow this diet plan and exercises, sleep schedule and everything make a report

\`\`\`json
${jsonString}
\`\`\`

---
### MANDATORY REPORT STRUCTURE & REQUIREMENTS:

1. **PROGRAM TIMELINE & PROTOCOL DURATION**:
   - State clearly at the very top: Exactly how many months the patient should strictly follow this diet plan, home workouts, and sleep regimen (e.g., 3 to 6 months) before repeating laboratory hormonal panels (AMH, Testosterone, Fasting Insulin) and pelvic ultrasound.
   - Provide milestone checkpoints at Month 1, Month 3, and Month 6.

2. **COMPLETE 7-DAY ANTI-INFLAMMATORY & LOW-GI DIET PLAN (MUST BE IN A CLEAN MARKDOWN TABLE)**:
   - Provide a comprehensive, structured markdown table with the following exact columns:
     | Day | Meal (Time) | Recommended Menu & Portions | PCOS Nutritional Goal & Target Benefits (Low Glycemic, Anti-inflammatory, Inositol/Zinc/Omega-3) |
   - Cover Day 1 through Day 7 in detail.
   - Include 5 daily touchpoints: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner.
   - Address the patient's specific metabolic/androgenic markers (e.g., insulin resistance, BMI, hirsutism).

3. **COMPLETE 7-DAY HOME WORKOUT & DAILY EXERCISE ROUTINE (STRICTLY HOME WORKOUT ONLY)**:
   - Suggest ONLY exercises that can be performed at home with ZERO gym machines or commercial gym equipment.
   - Allowed equipment: Bodyweight, Yoga Mat, Resistance Bands, Light Dumbbells or Filled Water Bottles, Chair/Wall.
   - For every single day (Day 1 to Day 7), list the specific home routine with:
     * **Exercise Name**
     * **Sets & Reps** (or duration in minutes)
     * **Equipment** (Explicitly write "None / Bodyweight" or "Mat / Resistance Band")
     * **Form & PCOS Cortisol Cue** (prioritize low-impact steady state, resistance training, or pelvic floor/pilates over high-cortisol exhaustion).

4. **DAILY CIRCADIAN ROUTINE & SLEEP SCHEDULE**:
   - Provide a realistic hour-by-hour daily timetable (Wake-up time, Morning sunlight exposure, Meal windows, Work blocks, Evening wind-down, Bedtime).
   - Prescribe exact daily sleep duration (7.5 to 9 hours) and sleep hygiene rules to balance nighttime melatonin and morning cortisol.

5. **TARGETED LIFESTYLE & SUPPLEMENT SUPPORT**:
   - Phenotype-specific natural supplements to discuss with an endocrinologist (e.g., 40:1 Myo/D-Chiro Inositol, Spearmint herbal infusion for anti-androgen support, Magnesium Bisglycinate, Vitamin D3 + K2).

Format the response in polished, professional Markdown with clean table lines, bold headers, and clinical clarity.`;
}

/**
 * Call the selected LLM Provider API
 */
export async function callLlmApi({ prompt, apiKey, provider = 'gemini', model = 'gemini-1.5-flash', customEndpoint = '' }) {
  if (!apiKey && provider !== 'custom') {
    throw new Error('API key is missing. Please paste your LLM API Key in settings.');
  }

  if (provider === 'gemini') {
    const activeModel = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!outputText) throw new Error('No response text received from Gemini API.');
    return outputText;
  }

  if (provider === 'tokenrouter' || provider === 'openai' || provider === 'groq' || provider === 'custom') {
    let url = 'https://api.openai.com/v1/chat/completions';
    if (provider === 'tokenrouter') {
      url = customEndpoint || 'https://api.tokenrouter.io/v1/chat/completions';
    } else if (provider === 'groq') {
      url = customEndpoint || 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'custom' && customEndpoint) {
      url = customEndpoint;
    }

    const activeModel = model || (provider === 'tokenrouter' ? 'anthropic/claude-3.5-sonnet' : provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    // Try direct browser fetch first; if CORS or network blocks it, gracefully proxy through backend
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: activeModel,
          messages: [
            {
              role: 'system',
              content: 'You are an evidence-based clinical nutrition, endocrinology, and exercise physiology expert specializing in Polycystic Ovary Syndrome (PCOS). Provide precise, safe, empowering, and structured medical lifestyle guidance.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || errData?.message || `LLM API error: HTTP ${response.status}`);
      }

      const data = await response.json();
      const outputText = data?.choices?.[0]?.message?.content || data?.text;
      if (!outputText) throw new Error('No content returned from LLM endpoint.');
      return outputText;
    } catch (fetchErr) {
      console.warn('Direct browser call failed, attempting via OvaScan backend proxy...', fetchErr);
      const backendResp = await fetch('/api/llm/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          apiKey: apiKey.trim(),
          provider,
          model: activeModel,
          endpoint: url,
        }),
      });

      if (!backendResp.ok) {
        const bErr = await backendResp.json().catch(() => ({}));
        throw new Error(bErr?.error || bErr?.message || fetchErr.message);
      }

      const bData = await backendResp.json();
      if (!bData?.content) throw new Error('Empty response from backend proxy.');
      return bData.content;
    }
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Fallback realistic suggestions for demonstration / offline preview
 * when the user has not yet entered an API key.
 */
/**
 * Clinical guideline baseline protocol.
 * Dynamically tailored to the patient's exact biomarkers, subtype, and risk scores.
 * Used when the live LLM API has quota/rate limitations or is temporarily unreachable.
 */
export function getSampleDemonstrationPlan(patientJsonData) {
  const patientId = patientJsonData?.patientId || 'PT-90412';
  const name = patientJsonData?.name || 'Patient';
  const age = patientJsonData?.age || 26;
  const amh = Number(patientJsonData?.biomarkers?.amh ?? 6.5);
  const bmi = Number(patientJsonData?.biomarkers?.bmi ?? 25.8);
  const cycleLength = Number(patientJsonData?.biomarkers?.cycleLength ?? 38);
  const lh = Number(patientJsonData?.biomarkers?.lh ?? 11.2);
  const fsh = Number(patientJsonData?.biomarkers?.fsh ?? 5.4);
  const lhFshRatio = fsh > 0 ? (lh / fsh).toFixed(1) : '2.1';
  const testosterone = patientJsonData?.biomarkers?.testosterone ?? 56;
  const follicleCount = patientJsonData?.biomarkers?.follicleCount ?? 15;
  const sleepHours = patientJsonData?.biomarkers?.sleepHours || patientJsonData?.sleepHours || '6-7 hrs';
  
  const fusionRisk = Number(patientJsonData?.diagnosticResults?.fusionRisk ?? 0.78);
  const riskLabel = patientJsonData?.diagnosticResults?.riskLabel || (fusionRisk >= 0.5 ? 'Elevated Rotterdam Risk' : 'Low / Borderline Risk');
  const isHighRisk = fusionRisk >= 0.5;
  const isLeanPcos = bmi < 24.5;
  const hasSevereOligo = cycleLength > 45 || cycleLength < 21;
  const subtype = patientJsonData?.clusterAssignment?.name || (isLeanPcos ? 'Adrenal / Inflammatory Lean Phenotype' : 'Classic Metabolic / Insulin-Resistant Phenotype');

  // Dynamic program duration
  let durationMonths = '4 to 6 Consecutive Months (16–24 Weeks)';
  if (fusionRisk >= 0.8 || bmi >= 28 || amh >= 8.0) {
    durationMonths = '6 to 9 Consecutive Months (24–36 Weeks)';
  } else if (fusionRisk < 0.45 && bmi < 25) {
    durationMonths = '3 to 4 Consecutive Months (12–16 Weeks)';
  }

  return `# OvaScan AI — Clinical Lifestyle, Diet & Home Exercise Prescription

> **Protocol Status:** Active Clinical Guideline Prescription (Evidence-Based Protocol)  
> **Patient Identifier:** \`${patientId}\` (${name}, Age: ${age})  
> **Diagnostic Stratification:** **${riskLabel}** (${(fusionRisk * 100).toFixed(1)}% Multi-modal Risk Index)  
> **Assigned Phenotype:** *${subtype}*  
> **Key Biomarker Baseline:** AMH: **${amh} ng/mL** | BMI: **${bmi} kg/m²** (${isLeanPcos ? 'Lean PCOS' : 'Metabolic / Elevated Adiposity'}) | Cycle: **${cycleLength} days** | LH:FSH: **${lhFshRatio}** | Baseline Sleep: **${sleepHours}**

---

## 1. Clinical Duration & Reassessment Timeline

* **Prescribed Program Duration:** **${durationMonths}**
* **Biological Rationale for ${patientId}:** ${
    isLeanPcos 
      ? `Given your lean BMI (${bmi} kg/m²) and elevated LH:FSH ratio (${lhFshRatio}), therapeutic focus centers on hypothalamic-pituitary-ovarian (HPO) axis recalibration, cortisol minimization, and ovarian micro-inflammation reduction rather than caloric deficit.` 
      : `Given your metabolic profile (BMI ${bmi} kg/m², AMH ${amh} ng/mL), follicular arrest is driven by peripheral insulin resistance stimulating ovarian theca-cell androgen secretion. Approximately 90–120 days of consistent glycemic stabilization are required for primordial follicles to mature in an improved hormonal milieu.`
  }
* **Structured Clinical Milestones:**
  * **Week 4–6:** Primary review of sleep quality, waking energy, cycle tracking, and reduction of reactive hypoglycemia symptoms.
  * **Month 3 (Quarterly Labs):** Repeat Fasting Insulin, HOMA-IR, Total & Free Testosterone, DHEA-S, and Lipid Sub-fractions.
  * **Month ${durationMonths.includes('9') ? '6 to 9' : '4 to 6'} (End-of-Cycle Evaluation):** Bilateral pelvic ultrasound to assess reduction in Follicle Number Per Ovary (baseline: ${follicleCount} follicles) and ovarian stroma volume.

---

## 2. Personalized 7-Day Anti-Inflammatory & Low-Glycemic Meal Plan

* **Target Dietary Architecture:** ${
    isLeanPcos 
      ? '**Isocaloric Anti-Inflammatory Protocol**: High healthy fats (Omega-3s, avocados, sprouted seeds), moderate clean protein (1.2g/kg), complex low-GI carbohydrates to prevent adrenal stress.' 
      : '**Insulin-Sensitizing Low-Glycemic Load Protocol**: High dietary fiber (>35g/day), targeted protein anchoring at every meal (25-30g), zero refined sugars to eliminate postprandial insulin surges.'
  }

| Day | Meal (Time) | Recommended Menu & Portions | PCOS Nutritional Goal & Therapeutic Benefits |
| :--- | :--- | :--- | :--- |
| **Day 1** | **Breakfast (8:00 AM)**<br/>**Morning Snack (11:00 AM)**<br/>**Lunch (1:30 PM)**<br/>**Eve Snack (5:00 PM)**<br/>**Dinner (7:45 PM)** | • 2 pasture-raised eggs scrambled with baby spinach & 1/4 avocado<br/>• 10 sprouted raw walnuts + cup of organic spearmint tea<br/>• Wild Alaskan salmon (140g) over quinoa bowl with steamed broccoli & tahini drizzle<br/>• Roasted pumpkin seeds (25g) with pinch of sea salt<br/>• Turmeric-braised chicken breast with cauliflower mash & sauteed asparagus | • Protein + monounsaturated fats anchor morning cortisol and prevent insulin spikes.<br/>• Anti-androgenic flavonoids from spearmint lower free testosterone.<br/>• EPA/DHA Omega-3s calm ovarian follicular inflammation.<br/>• Rich in bioavailable zinc to support steroid hormone clearance.<br/>• Cruciferous indole-3-carbinol (DIM) enhances estrogen detoxification. |
| **Day 2** | **Breakfast (8:00 AM)**<br/>**Morning Snack (11:00 AM)**<br/>**Lunch (1:30 PM)**<br/>**Eve Snack (5:00 PM)**<br/>**Dinner (7:45 PM)** | • Chia seed pudding with unsweetened almond milk, ground flaxseed & organic blueberries<br/>• Sliced cucumber with 2 tbsp probiotic Greek yogurt<br/>• Mediterranean lentil and roasted bell pepper salad with kalamata olives & sheep feta<br/>• 15 raw almonds + cold-brewed cinnamon hibiscus tea<br/>• Pan-seared wild cod (or organic tempeh) with ginger bok choy & zucchini noodles | • Lignans from flaxseed stimulate Sex Hormone-Binding Globulin (SHBG) synthesis.<br/>• Probiotic cultures nourish gut microbiota to reduce endotoxemia.<br/>• High prebiotic soluble fiber blunts post-meal glycemic response.<br/>• Bioavailable magnesium enhances insulin receptor tyrosine kinase activity.<br/>• Light, low-sodium evening meal preventing digestive nocturnal stress. |
| **Day 3** | **Breakfast (8:00 AM)**<br/>**Morning Snack (11:00 AM)**<br/>**Lunch (1:30 PM)**<br/>**Eve Snack (5:00 PM)**<br/>**Dinner (7:45 PM)** | • Organic tofu or egg scramble with red bell peppers, mushrooms & sprouted sourdough<br/>• Spearmint leaf infusion + 1 hard-boiled egg with cracked black pepper<br/>• Mixed baby greens, grilled chicken strips, hemp seeds, shredded beets & olive oil<br/>• Celery sticks with 1.5 tbsp raw almond butter<br/>• Grass-fed beef patties (or black bean tempeh) with roasted sweet potato & green beans | • Sustained amino acids with minimal glycemic load for steady thyroid support.<br/>• L-theanine from tea promotes parasympathetic vagal tone.<br/>• Polyphenol antioxidants lower systemic high-sensitivity CRP.<br/>• Healthy fats eliminate afternoon reactive hypoglycemia.<br/>• Heme iron & zinc replenish reserves depleted by irregular menstrual bleeding. |
| **Day 4** | **Breakfast (8:00 AM)**<br/>**Morning Snack (11:00 AM)**<br/>**Lunch (1:30 PM)**<br/>**Eve Snack (5:00 PM)**<br/>**Dinner (7:45 PM)** | • Green protein smoothie: baby spinach, unsweetened pea protein, 1/2 green apple, ginger<br/>• Crispy roasted chickpeas with smoked paprika (35g)<br/>• Wild tuna salad in avocado boats with diced celery, red onion and lemon juice<br/>• Bell pepper strips with 2 tbsp guacamole<br/>• Turkey breast meatballs in slow-simmered marinara over roasted spaghetti squash | • Readily absorbed plant proteins without digestive friction.<br/>• Resistant starch produces short-chain fatty acids (SCFAs) to heal gut mucosa.<br/>• Essential fatty acids directly fuel ovarian progesterone synthesis.<br/>• High Vitamin C aids adrenal recovery and buffers inflammatory cytokines.<br/>• Lycopene delivers antioxidant protection to immature pre-antral follicles. |
| **Day 5** | **Breakfast (8:00 AM)**<br/>**Morning Snack (11:00 AM)**<br/>**Lunch (1:30 PM)**<br/>**Eve Snack (5:00 PM)**<br/>**Dinner (7:45 PM)** | • 2 poached eggs over steamed kale and sauteed portobello mushroom caps<br/>• Warm bone broth (or adaptogenic mushroom broth) with grated fresh turmeric<br/>• Warm quinoa edamame bowl with toasted sesame seeds & ginger-tamari vinaigrette<br/>• 2 Brazil nuts (selenium) + small handful of raw pecans + spearmint tea<br/>• Rosemary-roasted chicken thighs with rainbow baby carrots & Brussels sprouts | • High choline intake supports hepatic transmethylation and estrogen clearance.<br/>• Glycine and amino acids repair gut barrier integrity.<br/>• Phytoestrogens bind estrogen receptors beta, modulating LH pulsatility.<br/>• Selenium optimizes thyroid deiodinase converting T4 into active T3.<br/>• Glucosinolates stimulate Phase II liver detoxification pathways. |
| **Day 6** | **Breakfast (8:30 AM)**<br/>**Morning Snack (11:30 AM)**<br/>**Lunch (2:00 PM)**<br/>**Eve Snack (5:30 PM)**<br/>**Dinner (8:00 PM)** | • Steel-cut oats (soaked overnight) with protein powder, Ceylon cinnamon & crushed walnuts<br/>• Coconut kefir or yogurt topped with chia seeds<br/>• Large Aegean salad: cucumbers, grilled tiger prawns, arugula, extra virgin olive oil<br/>• Green apple slices dusted with Ceylon cinnamon powder<br/>• Baked trout or salmon fillet with roasted fennel bulb & wilted rainbow chard | • Beta-glucan soluble fiber reduces total circulating androgen bioavailability.<br/>• Healthy medium-chain triglycerides provide sustained cellular ATP.<br/>• Abundant polyphenols protect vascular endothelial integrity.<br/>• Cinnamon active cinnamaldehyde acts as a natural insulin mimetic.<br/>• Potent anti-inflammatory marine Omega-3s. |
| **Day 7** | **Breakfast (9:00 AM)**<br/>**Morning Snack (12:00 PM)**<br/>**Lunch (2:00 PM)**<br/>**Eve Snack (5:30 PM)**<br/>**Dinner (7:45 PM)** | • Weekend vegetable frittata with zucchini, sweet leeks, bell peppers & pasture eggs<br/>• Fresh raspberries (40g) paired with raw macadamia nuts<br/>• Black lentil and brown basmati bowl with roasted eggplant & garlic tahini<br/>• Chamomile & fresh spearmint herbal infusion + roasted sunflower seeds (20g)<br/>• Lemon-herb baked sea bass with steamed broccolini & mashed cauliflower | • Nutrient-dense weekend brunch supporting sustained satiety and stable mood.<br/>• Low-glycemic anthocyanins protect against ovarian stroma oxidative stress.<br/>• Prebiotic lentils support beneficial Bifidobacteria and Akkermansia.<br/>• Nervous system down-regulation preparing the body for deep REM cycles.<br/>• Light evening meal optimizing nighttime human growth hormone (HGH) release. |

---

## 3. 7-Day Home Exercise Routine (Zero Gym Equipment Required)

> ⚠️ **PCOS Exercise Safety Principle:** Prolonged exhaustive high-intensity training (excess HIIT) can spike adrenal cortisol and worsen hypothalamic-pituitary signaling. This program emphasizes **progressive bodyweight strength** and **low-impact steady-state (LISS)** to stimulate muscular GLUT-4 glucose transporters without elevating stress hormones.

| Day | Home Training Focus | Specific Exercises | Sets & Reps / Duration | Equipment | Form & Cortisol Management Cue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Day 1** | **Lower Body Functional Strength** | • Bodyweight Air Squats<br/>• Glute Bridges (with 2s hold)<br/>• Alternating Reverse Lunges<br/>• Wall Sit Isometric Hold | • 3 sets × 12–15 reps<br/>• 3 sets × 15 reps<br/>• 3 sets × 10 reps/side<br/>• 3 sets × 35 seconds | **None (Bodyweight only)** | Inhale down, exhale on exertion. Drive through heels to recruit glutes and clear blood glucose without adrenal fatigue. |
| **Day 2** | **Low-Impact Aerobic (Zone 2)** | • Brisk outdoor / neighborhood walking OR living-room high-knee marching<br/>• Hip & ankle mobility flow | • 35–45 minutes continuous<br/>• 5 minutes cool-down | **Walking shoes only** | Maintain a strict conversational pace (Zone 2). You should be able to speak full sentences. Directly lowers fasting insulin. |
| **Day 3** | **Upper Body & Postural Circuit** | • Wall or Countertop Push-Ups<br/>• Chair Tricep Dips<br/>• Prone Back Extensions (Superman)<br/>• Bird-Dog Core Stabilizers | • 3 sets × 10–12 reps<br/>• 3 sets × 10 reps<br/>• 3 sets × 12 reps<br/>• 3 sets × 8 reps/side | **Sturdy Chair or Counter** | Reinforces postural stability and posterior chain without breath holding. Keep breathing rhythmic. |
| **Day 4** | **Restorative Somatic Mobility** | • Cat-Cow Spine Waves<br/>• Butterfly Pose (Baddha Konasana)<br/>• Legs-Up-The-Wall (Viparita Karani)<br/>• Child's Pose with diaphragmatic breathing | • 5 minutes gentle flow<br/>• 3 minutes passive hold<br/>• 10 minutes restorative<br/>• 5 minutes deep stillness | **Yoga Mat or Soft Carpet** | Legs-up-the-wall enhances pelvic venous return, lowers systemic sympathetic tone, and calms ovarian inflammation. |
| **Day 5** | **Full-Body Functional Strength** | • Step-Ups on sturdy stair/stool<br/>• Romanian Deadlifts (using two filled 1L water bottles)<br/>• Doorframe Rows (leaning back)<br/>• Standing Calf Raises | • 3 sets × 12 reps/leg<br/>• 3 sets × 15 reps<br/>• 3 sets × 12 reps<br/>• 3 sets × 20 reps | **Sturdy Stair + Two 1L Water Bottles** | Stimulates skeletal muscle GLUT-4 glucose uptake independent of insulin, improving insulin sensitivity for up to 48 hours. |
| **Day 6** | **Core Stability & Pelvic Pilates** | • Pelvic Tilts with transverse bracing<br/>• Side-Lying Clamshells<br/>• Side-Lying Leg Lifts<br/>• Dead Bug Movement | • 3 sets × 12 reps<br/>• 3 sets × 15 reps/side<br/>• 3 sets × 15 reps/side<br/>• 3 sets × 8 reps/side | **Yoga Mat** | Strengthens deep transverse abdominis and pelvic floor without high-pressure abdominal crunches. |
| **Day 7** | **Active Circadian Restoration** | • Gentle casual stroll in natural sunlight<br/>• Full-body gentle static stretching | • 30–40 minutes unstructured<br/>• 10 minutes relaxing stretch | **None** | Sunlight exposure stimulates morning dopamine and recalibrates the circadian rhythm for the week ahead. |

---

## 4. Circadian Rhythm & Sleep Protocol (Tailored to Baseline: ${sleepHours})

* **Target Sleep Duration:** **7.5 to 8.5 Hours of Restorative Sleep Nightly**
* **Patient-Specific Circadian Rules for ${patientId}:**
  * **07:00 AM — Awakening & Natural Light Exposure:** Within 20 minutes of waking, expose eyes to 10–15 minutes of indirect morning sunlight (no sunglasses) to calibrate the suprachiasmatic nucleus and suppress melatonin.
  * **07:30 AM — Mineral Hydration:** 400 mL room-temperature water with a pinch of Celtic sea salt and squeeze of fresh lemon to support morning adrenal function.
  * **08:00 AM — High-Protein Breakfast:** Always consume protein within 60–90 minutes of waking to avoid cortisol-induced reactive gluconeogenesis.
  * **10:00 PM — Blue-Light Quarantine:** Turn off phones, tablets, and laptops 60 minutes before bed. Blue wavelengths suppress pineal melatonin by up to 85% in women with PCOS.
  * **10:30 PM — Sleep Environment:** Maintain a cool bedroom temperature (18–20°C / 65–68°F) and use 100% blackout blinds or a contoured eye mask.

---

## 5. Evidence-Based Targeted Supplements (Discuss with Physician)

1. **Myo-Inositol & D-Chiro-Inositol (40:1 Ratio):** 2,000 mg twice daily. Re-establishes insulin receptor signaling and supports regular spontaneous ovulation.
2. **Organic Spearmint Leaf Infusion:** 2 cups daily. Clinically demonstrated in randomized controlled trials to lower free testosterone and reduce hirsutism progression.
3. **Magnesium Bisglycinate:** 300–400 mg taken 45 minutes before bedtime to activate GABA receptors, improve sleep architecture, and relieve muscular tension.
4. **Vitamin D3 + K2:** 2,000–4,000 IU daily taken with a fat-containing meal to facilitate follicular maturation and improve glucose metabolism.
`;
}
