const pool = require('../config/db');

// 1. Department Average Score
const getDepartmentAvgScore = async (department) => {
  const result = await pool.query(
    `
    SELECT department_name AS department, 
           ROUND(AVG(total_score)::NUMERIC, 2) AS average_score
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY department_name;
  `,
    [department]
  );

  return result.rows[0];
};

const getStudentCountByDepartment = async (department) => {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS student_count 
    FROM users 
    WHERE department = $1 AND role = 'Student';
    `,
    [department]
  );
  return result.rows[0];
};

const getDepartmentAvgScorePerExam = async (department) => {
  const result = await pool.query(
    `
    SELECT exam_id, exam_name, department_name AS department, 
           ROUND(AVG(total_score)::NUMERIC, 2) AS average_score
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY exam_id, exam_name, department_name
    ORDER BY average_score DESC;
  `,
    [department]
  );

  return result.rows;
};

const getCategoryPerformance = async (department) => {
  const result = await pool.query(
    `
    SELECT 
        department_name AS department,
        jsonb_each.key AS category,
        ROUND(AVG((jsonb_each.value->>'score')::FLOAT)::NUMERIC, 2) AS average_category_score,
        MAX((jsonb_each.value->>'score')::FLOAT)::NUMERIC AS max_category_score
    FROM student_analysis,
    LATERAL jsonb_each(category::jsonb)  
    WHERE department_name = $1
    GROUP BY department_name, jsonb_each.key;
  `,
    [department]
  );
  if (result.rows.length === 0) {
    return [
      {
        department: department,
        category: 'general knowledge',
        average_category_score: '0',
      },
      {
        department: department,
        category: 'quantitative aptitude',
        average_category_score: '0',
      },
      {
        department: department,
        category: 'logical reasoning',
        average_category_score: '0',
      },
      {
        department: department,
        category: 'technical',
        average_category_score: '0',
      },
      {
        department: department,
        category: 'verbal ability',
        average_category_score: '0',
      },
    ];
  }
  return result.rows;
};

// 3. Top Performer (Overall Best in Department)
const getTopPerformer = async (department) => {
  const result = await pool.query(
    `SELECT * FROM public.student_rank WHERE department_name=$1 ORDER BY department_rank ASC LIMIT 5`,
    [department]
  );

  return result.rows;
};

// 4. Bottom Performer (Overall Weakest in Department)
const getBottomPerformer = async (department) => {
  const result = await pool.query(
    `SELECT * FROM (
        SELECT * FROM public.student_rank 
        WHERE department_name = $1
        ORDER BY department_rank DESC 
        LIMIT 5
    ) AS subquery
    ORDER BY department_rank ASC;`,
    [department]
  );

  return result.rows;
};

// 5. Participation Rate Per Exam
const getParticipationRate = async (department) => {
  const result = await pool.query(
    `
    SELECT 
            department_name AS department,
            COUNT(DISTINCT student_id) AS students_attempted,
            (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name) AS total_students,
            ROUND((COUNT(DISTINCT student_id) * 100.0) / 
                  (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name), 2) AS participation_rate
        FROM student_analysis sa
        WHERE attempted = TRUE AND department_name=$1
        GROUP BY department_name
        ORDER BY participation_rate DESC;
  `,
    [department]
  );
  if (result.rows.length === 0) {
    return [
      {
        department: department,
        students_attempted: '0',
        total_students: null,
        participation_rate: '0',
      },
    ];
  }
  return result.rows[0];
};
const getParticipationRatePerExam = async (department) => {
  const result = await pool.query(
    `
    SELECT 
        sa.department_name,
        sa.exam_id,
        (COUNT(DISTINCT sa.student_id) * 100.0) / 
        NULLIF((SELECT COUNT(DISTINCT u.user_id) 
                FROM users u 
                WHERE u.department = sa.department_name 
                  AND u.role = 'Student'), 0) 
        AS participation_rate
    FROM student_analysis sa
    WHERE sa.attempted = TRUE
      AND sa.department_name = $1
    GROUP BY sa.department_name, sa.exam_id;
  `,
    [department]
  );
  return result.rows;
};

// 6. Accuracy Rate
const getAccuracyRate = async (department) => {
  const result = await pool.query(
    `
    SELECT 
      sa.department_name,
      ROUND((((SUM(sa.total_score) * 100.0) / NULLIF(SUM(sa.max_score), 0))::NUMERIC), 2) AS accuracy_rate
    FROM student_analysis sa
    WHERE department_name=$1
    GROUP BY sa.department_name
    ORDER BY accuracy_rate DESC;
  `,
    [department]
  );
  return result.rows[0];
};

// 8. Weak Areas
const getWeakAreas = async (department) => {
  const result = await pool.query(
    `
    SELECT 
        department_name AS department, 
        jsonb_each.key AS category, 
        COUNT(*) AS incorrect_count
    FROM student_analysis, 
    LATERAL jsonb_each(category::jsonb)  
    WHERE department_name = $1 
    AND (jsonb_each.value->>'score')::FLOAT < ((jsonb_each.value->>'max_score')::FLOAT * 0.5)  
    GROUP BY department_name, jsonb_each.key
    ORDER BY incorrect_count DESC
    LIMIT 5;
  `,
    [department]
  );

  return result.rows;
};

const getPerformanceOverTime = async (department) => {
  const result = await pool.query(
    `
    WITH latest_exams AS (
    SELECT 
        sa.exam_id,
        sa.exam_name,
        sa.department_name AS department,
        ROUND(AVG(sa.total_score)::NUMERIC, 0) AS average_score,
        TO_CHAR(e.created_at, 'Mon YYYY') AS created_on,
        ROW_NUMBER() OVER (ORDER BY e.created_at DESC) AS row_num
    FROM student_analysis sa
    JOIN exams e ON sa.exam_id = e.exam_id
    WHERE sa.department_name = $1
    GROUP BY sa.exam_id, sa.exam_name, sa.department_name, e.created_at
)
SELECT exam_id, exam_name, department, average_score, created_on
FROM latest_exams
WHERE row_num <= 5
ORDER BY created_on ASC;
  `,
    [department]
  );

  if (result.rows.length === 0) {
    return [{}];
  }

  return result.rows;
};

const deptRanks = async (department) => {
  try {
    const result = await pool.query(
      `
        WITH department_averages AS (
            SELECT 
                sa.department_name AS department,
                ROUND(AVG(sa.total_score)::NUMERIC, 2) AS average_score,
                COUNT(DISTINCT sa.exam_id) AS exams_count,
                COUNT(DISTINCT sa.student_id) AS students_count
            FROM student_analysis sa
            GROUP BY sa.department_name
        )
        SELECT 
            department,
            average_score,
            exams_count,
            students_count,
            department_rank
        FROM (
            SELECT 
                department,
                average_score,
                exams_count,
                students_count,
                RANK() OVER (ORDER BY average_score DESC) AS department_rank
            FROM department_averages
        ) ranked_departments
        WHERE department = $1;  -- Replace $1 with your department name (or use a parameter in a query)
            `,
      [department]
    );
    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getDepartmentAvgScore,
  getDepartmentAvgScorePerExam,
  getCategoryPerformance,
  getTopPerformer,
  getBottomPerformer,
  getParticipationRate,
  getParticipationRatePerExam,
  getAccuracyRate,
  getWeakAreas,
  getPerformanceOverTime,
  deptRanks,
  getStudentCountByDepartment,
};
