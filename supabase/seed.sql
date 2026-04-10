-- PBL Markets — Seed Data
-- Run AFTER schema.sql. Run in Supabase SQL Editor.

-- ─── Seed markets (run after at least one user signs up to get a created_by UUID) ──
-- Replace '00000000-0000-0000-0000-000000000000' with your actual admin user UUID
-- You can find it in Authentication → Users in Supabase Dashboard

do $$
declare admin_id uuid;
begin
  select id into admin_id from public.profiles where is_admin = true limit 1;
  if admin_id is null then
    raise exception 'No admin user found. Sign in first and run: UPDATE profiles SET is_admin = true WHERE email = ''your@email.com'';';
  end if;

  insert into public.markets (title, description, category, yes_pool, no_pool, closes_at, created_by) values
  (
    'De Anza PBL places Top 3 at NLC Las Vegas',
    'National Leadership Conference, June 6–8, 2026 in Las Vegas. Does the chapter podium in overall ranking?',
    'competition', 420, 580,
    '2026-06-08 23:59:00+00', admin_id
  ),
  (
    'April 21 Shark Tank event draws 20+ new member signups',
    'The VC Shark Tank pitch event hosted by PBL on April 21, 2026. Will it attract 20 or more prospective new members?',
    'events', 650, 350,
    '2026-04-22 23:59:00+00', admin_id
  ),
  (
    'PBL chapter reaches 60 active internal members by Fall 2026',
    'Will the chapter grow its active internal member count to 60 or more by the start of Fall 2026?',
    'growth', 480, 520,
    '2026-09-30 23:59:00+00', admin_id
  ),
  (
    'State of Chapter award defended at NLC nationals',
    'De Anza PBL won State of Chapter at the state conference. Can the chapter defend or improve at nationals?',
    'competition', 720, 280,
    '2026-06-08 23:59:00+00', admin_id
  ),
  (
    'Foundations of CS earns national placement at NLC',
    'De Anza PBL placed 2nd at state in Foundations of Computer Science. Will the competitor place at nationals?',
    'competition', 580, 420,
    '2026-06-08 23:59:00+00', admin_id
  ),
  (
    'PBL hosts 5 or more events before end of Spring 2026 semester',
    'Counting all general meetings, workshops, panels, and socials through June 20, 2026.',
    'operations', 810, 190,
    '2026-06-20 23:59:00+00', admin_id
  ),
  (
    'PBL membership grows 25% year-over-year by Spring 2027',
    'Compared to internal member count in Spring 2026. Will the chapter hit 25%+ YoY growth?',
    'growth', 550, 450,
    '2027-05-01 23:59:00+00', admin_id
  );

end $$;

-- ─── Set admin for your account ───────────────────────────────────────────────
-- After signing in for the first time, run this with your email:
-- UPDATE public.profiles SET is_admin = true, full_name = 'Arya Somu', role = 'VP Strategy & Development' WHERE email = 'your@email.com';

-- ─── Member roster (for reference — members join via magic link signup) ────────
-- When a member signs in for the first time their profile is auto-created.
-- You can pre-populate their display names and roles using the admin panel,
-- or run the UPDATE statements below after they sign up.
--
-- Officer roles (update after each person signs up):
--
-- UPDATE profiles SET full_name = 'Nisa Pradhan',       role = 'President'                    WHERE email = 'nisa@email.com';
-- UPDATE profiles SET full_name = 'Carine Chan',        role = 'Vice President'                WHERE email = 'carine@email.com';
-- UPDATE profiles SET full_name = 'George Huang',       role = 'VP Finance'                   WHERE email = 'george@email.com';
-- UPDATE profiles SET full_name = 'Addy Hu',            role = 'VP Operations'                WHERE email = 'addy@email.com';
-- UPDATE profiles SET full_name = 'Nhi Tran',           role = 'VP Marketing'                 WHERE email = 'nhi@email.com';
-- UPDATE profiles SET full_name = 'Christina Tran',     role = 'VP Club Affairs'              WHERE email = 'christina@email.com';
-- UPDATE profiles SET full_name = 'Iker Amox Jimenez',  role = 'Director, Strategy'           WHERE email = 'iker@email.com';
-- UPDATE profiles SET full_name = 'Dianne Johnson',     role = 'Director, Operations'         WHERE email = 'dianne@email.com';
-- UPDATE profiles SET full_name = 'Jordan Nguyen',      role = 'Director, Marketing'          WHERE email = 'jordan@email.com';
-- UPDATE profiles SET full_name = 'Anna Huynh',         role = 'Director, Finance'            WHERE email = 'anna@email.com';
-- UPDATE profiles SET full_name = 'Derick Nguyen',      role = 'Logistics Intern'             WHERE email = 'dericknguyen213@gmail.com';
-- UPDATE profiles SET full_name = 'Edward Wong',        role = 'Strategy Intern'              WHERE email = 'edward@email.com';
-- UPDATE profiles SET full_name = 'William Devanney',   role = 'Fundraising Intern'           WHERE email = 'devanneywilliam14@gmail.com';
-- UPDATE profiles SET full_name = 'Rameesha Farrukh',   role = 'Membership Intern'            WHERE email = 'rameesha800@gmail.com';
--
-- Internal members (auto-named on signup, update if needed):
-- UPDATE profiles SET full_name = 'Sophia Guidicotti'   WHERE email = 'sophia.gguidicotti@icloud.com';
-- UPDATE profiles SET full_name = 'Chi Hsun Lee'        WHERE email = 'asfrankielee@gmail.com';
-- UPDATE profiles SET full_name = 'Bryant Vo'           WHERE email = 'bryguy.vo@gmail.com';
-- UPDATE profiles SET full_name = 'Timothy Nguyen'      WHERE email = 'tnguyenexc@gmail.com';
-- UPDATE profiles SET full_name = 'Haley Truong'        WHERE email = 'itshaleytruong@gmail.com';
-- UPDATE profiles SET full_name = 'Ethan Nguyen'        WHERE email = 'ethan2288123@gmail.com';
-- UPDATE profiles SET full_name = 'Wenyu Qian'          WHERE email = 'wenyuqian22@gmail.com';
-- UPDATE profiles SET full_name = 'Jayden Phan'         WHERE email = 'jaydenphan52@gmail.com';
-- UPDATE profiles SET full_name = 'ShangRong Ma'        WHERE email = 'iamgordonma13@gmail.com';
-- UPDATE profiles SET full_name = 'Nikunj More'         WHERE email = 'nikunjmore12@gmail.com';
-- UPDATE profiles SET full_name = 'Anusha Shringi'      WHERE email = 'anushashringi@gmail.com';
-- UPDATE profiles SET full_name = 'Dawit Mekuria'       WHERE email = 'dawitmekuria28@gmail.com';
-- UPDATE profiles SET full_name = 'Kyle Krawez'         WHERE email = 'kylekrawez@gmail.com';
-- UPDATE profiles SET full_name = 'Jacob Chen'          WHERE email = 'jajucc1212@gmail.com';
-- UPDATE profiles SET full_name = 'Arin Kumar'          WHERE email = 'arink628@gmail.com';
-- UPDATE profiles SET full_name = 'Ilay Botzer'         WHERE email = 'ilaybotzer@gmail.com';
-- UPDATE profiles SET full_name = 'Leo Chao'            WHERE email = 'chaohaoshiang@gmail.com';
-- UPDATE profiles SET full_name = 'Ping Tse Chang'      WHERE email = 'lucaschang0414@gmail.com';
-- UPDATE profiles SET full_name = 'Joshua Morris'       WHERE email = 'atjdmorris@gmail.com';
-- UPDATE profiles SET full_name = 'Tran Dang'           WHERE email = 'ngbtrandang@gmail.com';
-- UPDATE profiles SET full_name = 'Francisco Rodriguez' WHERE email = 'franciscorodriguez28904@gmail.com';
-- UPDATE profiles SET full_name = 'Ruirui Wu'           WHERE email = 'ruiruiwu077@gmail.com';
-- UPDATE profiles SET full_name = 'Jocelyn Ramirez Rivera' WHERE email = 'jocelynramirez13777@gmail.com';
-- UPDATE profiles SET full_name = 'Kathy Nguyen'        WHERE email = 'nguyenkathy665@gmail.com';
-- UPDATE profiles SET full_name = 'Phillip Chang'       WHERE email = 'changphillip2004@gmail.com';
-- UPDATE profiles SET full_name = 'Haley Chu'           WHERE email = 'haleyforcollege33@gmail.com';
-- UPDATE profiles SET full_name = 'Jason Zhou'          WHERE email = 'jasonzhou.hk@gmail.com';
-- UPDATE profiles SET full_name = 'Rana Arjumand'       WHERE email = 'ranaarjumand07@gmail.com';
-- UPDATE profiles SET full_name = 'Emmanuel Aceves'     WHERE email = 'acevesemmanuel25@gmail.com';
-- UPDATE profiles SET full_name = 'Teresa Hsu'          WHERE email = 'teresadthsu@gmail.com';
-- UPDATE profiles SET full_name = 'Thin Thida Soe'      WHERE email = 'thinthidasoekath21@gmail.com';
-- UPDATE profiles SET full_name = 'Rebecca Yim'         WHERE email = 'rebeccay1810@gmail.com';
-- UPDATE profiles SET full_name = 'Zhen Huey Lee'       WHERE email = 'zackhale1234@gmail.com';
-- UPDATE profiles SET full_name = 'Janet Wong'          WHERE email = 'janetwong8228@gmail.com';
-- UPDATE profiles SET full_name = 'Jasmine Perlas'      WHERE email = 'perlas.jasmine21@gmail.com';
-- UPDATE profiles SET full_name = 'Lucas Avila'         WHERE email = 'lsucavil2@gmail.com';
-- UPDATE profiles SET full_name = 'Ashwika Agarwal'     WHERE email = 'ashwika.19864@gmail.com';
-- UPDATE profiles SET full_name = 'Lehem Atsebha'       WHERE email = 'lehematsebha@gmail.com';
-- UPDATE profiles SET full_name = 'Vincent Shao'        WHERE email = 'v.shaovincent@gmail.com';
-- UPDATE profiles SET full_name = 'Anirudh Ahluwalia'   WHERE email = 'aahluwalia2006@gmail.com';
-- UPDATE profiles SET full_name = 'Sarah Bednarek'      WHERE email = 'sincerelysarah0217@gmail.com';
-- UPDATE profiles SET full_name = 'Elena Burgos'        WHERE email = 'elepollard506@gmail.com';
-- UPDATE profiles SET full_name = 'Zealous Lee'         WHERE email = 'zealclee@gmail.com';
-- UPDATE profiles SET full_name = 'Audrey Tai'          WHERE email = 'taiaudrey127@gmail.com';
-- UPDATE profiles SET full_name = 'Amaan Hussain'       WHERE email = 'hussainamaan482@gmail.com';
-- UPDATE profiles SET full_name = 'James Yoshida'       WHERE email = 'james.yosh33@gmail.com';
-- UPDATE profiles SET full_name = 'Olivia Ma'           WHERE email = 'olma102015@gmail.com';
-- UPDATE profiles SET full_name = 'Evan Hoeffner'       WHERE email = 'evanhoeffner@gmail.com';
-- UPDATE profiles SET full_name = 'Jedrick Lachica'     WHERE email = 'randygames73@gmail.com';
-- UPDATE profiles SET full_name = 'Amy Tran'            WHERE email = 'amy.tran2700@gmail.com';
-- UPDATE profiles SET full_name = 'Helen Nguyen'        WHERE email = 'nguyenhn7010@gmail.com';
-- UPDATE profiles SET full_name = 'Harika Talluri'      WHERE email = 'harikat07@gmail.com';
-- UPDATE profiles SET full_name = 'Rivers Calareso'     WHERE email = 'riverscalareso@gmail.com';
-- UPDATE profiles SET full_name = 'Brian Phan'          WHERE email = 'brianqphan07@gmail.com';
-- UPDATE profiles SET full_name = 'Serena Ni'           WHERE email = 'serenani0106@gmail.com';
-- UPDATE profiles SET full_name = 'Anya Faria'          WHERE email = 'anya.x.faria@gmail.com';
-- UPDATE profiles SET full_name = 'Eric Zhao'           WHERE email = 'ericzhao0246@gmail.com';
-- UPDATE profiles SET full_name = 'Jayden Mai'          WHERE email = 'jaydemai2025@gmail.com';
-- UPDATE profiles SET full_name = 'Parker Elsey'        WHERE email = 'parker.elsey@gmail.com';
-- UPDATE profiles SET full_name = 'Ella Yang'           WHERE email = 'yne2708@gmail.com';
-- UPDATE profiles SET full_name = 'Jacob Eliashberg'    WHERE email = 'sendm2j@gmail.com';
-- UPDATE profiles SET full_name = 'Juliana Estrada'     WHERE email = 'estradaximena10@gmail.com';
-- UPDATE profiles SET full_name = 'Caleb Man'           WHERE email = 'calebman0607@gmail.com';
-- UPDATE profiles SET full_name = 'Om Bathija'          WHERE email = 'omjbathija@gmail.com';
-- UPDATE profiles SET full_name = 'Shakil Musthafa'     WHERE email = 'shakil.musthafa01@gmail.com';
-- UPDATE profiles SET full_name = 'Yen Hern Chan'       WHERE email = 'yenhern26@gmail.com';
-- UPDATE profiles SET full_name = 'Angelo Maniraho'     WHERE email = 'angelo.maniraho@gmail.com';
