-- Seed doctors, patients, diseases, medical_records (users created in init-db.js)

INSERT INTO doctors (id, full_name, specialization, phone, email, department, schedule, status) VALUES
(1, 'Dr. Sarah Chen', 'Internal Medicine', '+1-555-0101', 's.chen@caretrack.local', 'General Medicine',
 '{"mon":[{"start":"09:00","end":"12:00"},{"start":"13:00","end":"17:00"}],"tue":[{"start":"09:00","end":"12:00"}],"wed":[{"start":"09:00","end":"17:00"}],"thu":[{"start":"10:00","end":"16:00"}],"fri":[{"start":"09:00","end":"13:00"}],"sat":[],"sun":[]}',
 'active'),
(2, 'Dr. Michael Okonkwo', 'Cardiology', '+1-555-0102', 'm.okonkwo@caretrack.local', 'Cardiology',
 '{"mon":[{"start":"08:00","end":"12:00"}],"tue":[{"start":"08:00","end":"12:00"},{"start":"14:00","end":"18:00"}],"wed":[],"thu":[{"start":"08:00","end":"12:00"}],"fri":[{"start":"08:00","end":"14:00"}],"sat":[],"sun":[]}',
 'active'),
(3, 'Dr. Emily Nakamura', 'Pediatrics', '+1-555-0103', 'e.nakamura@caretrack.local', 'Pediatrics',
 '{"mon":[{"start":"09:00","end":"15:00"}],"tue":[{"start":"09:00","end":"15:00"}],"wed":[{"start":"09:00","end":"15:00"}],"thu":[{"start":"09:00","end":"15:00"}],"fri":[{"start":"09:00","end":"12:00"}],"sat":[],"sun":[]}',
 'active'),
(4, 'Dr. James Walsh', 'Orthopedic Surgery', '+1-555-0104', 'j.walsh@caretrack.local', 'Surgery',
 '{"mon":[],"tue":[{"start":"07:00","end":"11:00"}],"wed":[{"start":"07:00","end":"11:00"}],"thu":[{"start":"07:00","end":"11:00"}],"fri":[],"sat":[],"sun":[]}',
 'active'),
(5, 'Dr. Priya Sharma', 'Dermatology', '+1-555-0105', 'p.sharma@caretrack.local', 'Dermatology',
 '{"mon":[{"start":"10:00","end":"16:00"}],"tue":[{"start":"10:00","end":"16:00"}],"wed":[],"thu":[{"start":"10:00","end":"16:00"}],"fri":[{"start":"10:00","end":"16:00"}],"sat":[{"start":"09:00","end":"13:00"}],"sun":[]}',
 'inactive');

INSERT INTO patients (id, full_name, date_of_birth, gender, phone, email, address, emergency_contact, registered_by) VALUES
(1, 'Robert Hayes', '1985-03-12', 'male', '+1-555-1001', 'r.hayes@email.com', '12 Oak St, Springfield', 'Jane Hayes +1-555-2001', 3),
(2, 'Maria Gonzalez', '1992-07-22', 'female', '+1-555-1002', 'm.gonzalez@email.com', '45 Maple Ave', 'Carlos Gonzalez +1-555-2002', 2),
(3, 'David Kim', '1978-11-05', 'male', '+1-555-1003', NULL, '88 River Rd', 'Susan Kim +1-555-2003', 1),
(4, 'Linda Foster', '2001-01-30', 'female', '+1-555-1004', 'l.foster@email.com', '3 Hill Ln', 'Tom Foster +1-555-2004', 3),
(5, 'Ahmed Hassan', '1965-09-14', 'male', '+1-555-1005', 'a.hassan@email.com', '901 Cedar Blvd', 'Fatima Hassan +1-555-2005', 2),
(6, 'Sophie Martin', '2010-04-18', 'female', '+1-555-1006', NULL, '22 Birch Way', 'Claire Martin +1-555-2006', 1),
(7, 'Kevin O''Brien', '1995-12-01', 'male', '+1-555-1007', 'k.obrien@email.com', '77 Pine St', 'Mary O''Brien +1-555-2007', 3),
(8, 'Yuki Tanaka', '1988-06-25', 'female', '+1-555-1008', 'y.tanaka@email.com', '15 Lakeview Dr', 'Hiro Tanaka +1-555-2008', 2),
(9, 'Marcus Webb', '1972-02-08', 'male', '+1-555-1009', NULL, '400 Elm Ct', 'Diana Webb +1-555-2009', 1),
(10, 'Elena Popov', '1999-10-20', 'female', '+1-555-1010', 'e.popov@email.com', '60 Spruce Rd', 'Ivan Popov +1-555-2010', 3);

INSERT INTO diseases (id, icd_code, name, description, category, severity) VALUES
(1, 'J18.9', 'Pneumonia, unspecified organism', 'Infection inflaming air sacs in one or both lungs.', 'Respiratory', 'moderate'),
(2, 'E11.9', 'Type 2 diabetes mellitus without complications', 'Chronic metabolic disorder with insulin resistance.', 'Endocrine', 'moderate'),
(3, 'I10', 'Essential (primary) hypertension', 'High blood pressure without secondary cause.', 'Cardiovascular', 'mild'),
(4, 'M54.5', 'Low back pain', 'Pain in lumbar region of the spine.', 'Musculoskeletal', 'mild'),
(5, 'J45.909', 'Unspecified asthma, uncomplicated', 'Chronic inflammatory airway disease.', 'Respiratory', 'moderate'),
(6, 'K21.9', 'Gastro-esophageal reflux disease without esophagitis', 'Stomach acid flows back into esophagus.', 'Gastrointestinal', 'mild'),
(7, 'F41.1', 'Generalized anxiety disorder', 'Excessive anxiety and worry across situations.', 'Mental health', 'moderate'),
(8, 'L20.9', 'Atopic dermatitis, unspecified', 'Eczema; itchy inflammation of the skin.', 'Dermatology', 'mild'),
(9, 'N39.0', 'Urinary tract infection, site not specified', 'Bacterial infection of the urinary system.', 'Genitourinary', 'moderate'),
(10, 'R51.9', 'Headache, unspecified', 'Pain in head region without specified cause.', 'Neurological', 'mild');

INSERT INTO medical_records (id, patient_id, doctor_id, disease_id, visit_date, symptoms, treatment_notes, prescription, created_by) VALUES
(1, 1, 1, 1, '2025-11-02', 'Fever, productive cough', 'Chest auscultation; hydration', 'Amoxicillin 500mg TID x 7d', 2),
(2, 2, 2, 3, '2025-11-05', 'Headaches, elevated BP at home', 'Lifestyle counseling; recheck in 4w', 'Lisinopril 10mg daily', 2),
(3, 3, 1, 2, '2025-11-07', 'Polyuria, fatigue', 'HbA1c reviewed; diet education', 'Metformin 500mg BID', 1),
(4, 4, 3, 5, '2025-11-08', 'Wheezing after exercise', 'Spirometry scheduled', 'Albuterol inhaler PRN', 2),
(5, 5, 2, 3, '2025-11-10', 'Asymptomatic; routine follow-up', 'Continue current regimen', 'Continue lisinopril', 2),
(6, 6, 3, 8, '2025-11-11', 'Itchy patches elbows', 'Emollients; avoid triggers', 'Hydrocortisone 1% cream BID', 1),
(7, 7, 4, 4, '2025-11-12', 'Pain lifting heavy objects', 'NSAIDs; PT referral', 'Ibuprofen 400mg TID x 5d', 2),
(8, 8, 5, 8, '2025-11-14', 'Rash on arms', 'Patch testing discussed', 'Triamcinolone cream QD', 2),
(9, 9, 1, 6, '2025-11-15', 'Heartburn nightly', 'Weight reduction plan', 'Omeprazole 20mg daily', 1),
(10, 10, 1, 9, '2025-11-16', 'Dysuria, urgency', 'Urinalysis positive', 'Nitrofurantoin 100mg BID x 5d', 2),
(11, 1, 1, 3, '2025-11-18', 'BP check', 'Stable on meds', 'Continue current', 2),
(12, 2, 2, 2, '2025-11-19', 'DM follow-up', 'Improved glucose logs', 'Increase metformin per endo', 2),
(13, 5, 1, 7, '2025-11-20', 'Sleep difficulty, worry', 'CBT referral', 'Sertraline 25mg daily starter', 1),
(14, 8, 3, 5, '2025-11-21', 'Asthma action plan review', 'Technique checked', 'Fluticasone MDI BID', 2),
(15, 4, 1, 10, '2025-11-22', 'Tension headache', 'Stress management', 'Acetaminophen PRN', 2);
