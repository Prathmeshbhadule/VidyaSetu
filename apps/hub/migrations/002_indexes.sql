-- Versioned Migration 002: Indexes for High Concurrency Performance

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, date);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_at_risk_student ON at_risk_flags(student_id);
CREATE INDEX IF NOT EXISTS idx_change_log_school_seq ON change_log(school_id, seq);
CREATE INDEX IF NOT EXISTS idx_outbox_priority_created ON outbox(priority, created_at);
