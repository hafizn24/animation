# Episode 1 Master Production Plan: "The Oaks" (Remotion 3D Animated)

## 1. Core Profile & Story Framework
* **Protagonist**: **The Ambitious Underdog** (New Owner model in navy sweater & messenger bag). An obsessive football purist who poured his life savings into buying his hometown team, believing his vision and determination can rebuild the club from the mud.
* **The Club**: **Oakhaven United FC** ("The Oaks"), 6th Division (National League North/South level).
* **Format**: **Cinematic 3D Video via Remotion** (using Three.js procedural sets and rigs).
* **Audio / Dialogue Style**: **No TTS (Text-to-Speech)**. Communicated entirely through **stylized cinematic subtitles, kinetic lower-thirds, environmental foley, and dramatic soundtrack cues**.
* **Total Target Run-time**: ~60 to 90 seconds (concise, high-impact pilot sequence of 5 distinct scenes).

---

## 2. Character Dynamics & Current Issues
1. **The Ambitious Owner**:
   * *Motivation*: Gambling everything he has to prove that genuine passion and modern grit can resurrect a community club.
   * *Flaw*: Over-optimistic about the scale of non-league rot; has no safety net if this fails.
2. **The Old Chairman** (Grey 3-piece suit, gold spectacles, walking cane):
   * Cynical, tired, and relieved to wash his hands of the club's financial sinkhole.
3. **The Veteran Coach** (Navy/maroon tracksuit, whistle):
   * Resigned to losing; views the new owner as another starry-eyed idealist who will abandon them by winter.
4. **The Immediate Reality & Friction**:
   * Patchy pitch, leaking club facilities, morale at rock bottom, squad unpaid, and a team languishing in the relegation zone of the 6th tier.

---

## 3. Scene-by-Scene Shot List & Subtitle Script

### Scene 1: The Gamble (Duration: ~15s / 450 frames @ 30fps)
* **Environment**: `stadium.js` (Dawn, mist, overcast skies, empty stands)
* **Camera**: Low slow-tracking shot following the New Owner walking onto the worn pitch with his messenger bag.
* **Action**: Stops at the center circle, looking up at the aged wooden grandstand.
* **On-Screen Subtitles / Narrative**:
  > *"Ten years of savings. Every penny I ever earned."*  
  > *"Everyone said buying a 6th division club was financial suicide."*  
  > *"They were probably right. But this is home."*

---

### Scene 2: The Sinking Ship (Duration: ~15s / 450 frames)
* **Environment**: `stadium.js` (Matchday / Pitchside)
* **Camera**: Dynamic side tracking along the touchline, cutting to Coach blowing whistle, then to players beaten on the pitch.
* **Action**: Scoreboard reveals `Oakhaven 0 - 3 Guest`. Coach slumps his shoulders. Players with hands on hips, head down.
* **On-Screen Subtitles / Narrative**:
  > *"6th Division. 19th place. Winless in seven games."*  
  > *"The pitch is falling apart, and the team stopped believing weeks ago."*

---

### Scene 3: The Cold Truth (Duration: ~18s / 540 frames)
* **Environment**: `locker-room.js` (Flickering fluorescent strip lights, worn benches)
* **Camera**: Dolly through the doorway past hanging jerseys into the quiet locker room.
* **Action**: New Owner steps in to speak. Coach doesn't even look up while untying his boots; players pack bags in stony silence.
* **On-Screen Subtitles / Narrative**:
  > **Owner**: *"I know it’s been tough. But things change starting today."*  
  > **Coach**: *"With respect, boss... words don't pay the electric bill. Or the lads' wages."*

---

### Scene 4: The Handover (Duration: ~18s / 540 frames)
* **Environment**: `manager-office.js` (Warm desk lamp, rain on window)
* **Camera**: Over-the-shoulder medium shot across the mahogany desk.
* **Action**: Chairman slides the brass keys and thick transfer deeds across the table. He grips his cane and stands up.
* **On-Screen Subtitles / Narrative**:
  > **Chairman**: *"It's your headache now, son. Try not to drown."*  
  > **Owner**: *"I will turn this club around. Whatever it takes."*

---

### Scene 5: The Cliffhanger (Duration: ~14s / 420 frames)
* **Environment**: `manager-office.js` (Darkened room, single desk lamp on)
* **Camera**: Slow zoom into the New Owner reviewing paperwork under the lamp.
* **Action**: He picks up a red-stamped confidential document marked **DEFAULT NOTICE**. Hands freeze.
* **On-Screen Subtitles / Narrative**:
  > *"Hidden private loan clause: £450,000 overdue."*  
  > *"Full payment due in 30 days — or the ground is seized and demolished."*  
  > *"My life savings only bought the debt."*  
* **Cut to Black**: Impactful sound cue & Title Card: **OAKHAVEN UNITED: EPISODE 1**.

---

## 4. Technical Implementation Pipeline (Remotion)
* **Compositions Structure**:
  * `remotion/src/Episode1/Episode1Composition.jsx`: Main timeline sequencer using Remotion's `<Series>` or `<Sequence>`.
  * `remotion/src/Episode1/scenes/`: 
    * `Scene1Opening.jsx` (`stadium.js`)
    * `Scene2Matchday.jsx` (`stadium.js`)
    * `Scene3LockerRoom.jsx` (`locker-room.js`)
    * `Scene4Handover.jsx` (`manager-office.js`)
    * `Scene5Cliffhanger.jsx` (`manager-office.js`)
  * `remotion/src/components/Subtitles.jsx`: Custom cinematic typography overlay with subtle drop-shadows and letter-spacing (no TTS required).
