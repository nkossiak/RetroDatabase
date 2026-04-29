CREATE DATABASE IF NOT EXISTS retro_collection;
USE retro_collection;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 07:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `retro_collection`
--

-- --------------------------------------------------------

--
-- Table structure for table `consoles`
--

CREATE TABLE `consoles` (
  `console_id` int(11) NOT NULL,
  `console_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `consoles`
--

INSERT INTO `consoles` (`console_id`, `console_name`) VALUES
(1, 'NES'),
(2, 'SNES');

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `console_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `release_year` int(11) DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`game_id`, `user_id`, `console_id`, `title`, `release_year`, `completed`, `created_at`) VALUES
(3, 2, 1, 'Megaman', 1994, 0, '2026-04-28 00:43:21'),
(5, 1, 1, 'Zelda: A link to the Past', 1994, 0, '2026-04-28 01:46:49'),
(6, 1, 2, 'Donkey Kong Country 3', 1996, 1, '2026-04-28 01:54:49'),
(8, 1, 2, 'Earthbound', 1994, 1, '2026-04-28 02:01:58'),
(9, 1, 2, 'Super Mario World', 1990, 1, '2026-04-28 02:03:46'),
(10, 1, 2, 'Final Fantasy III', 1994, 0, '2026-04-28 02:04:21'),
(11, 1, 1, 'Super Mario Bros 3', 1988, 0, '2026-04-28 02:07:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(1, 'Kiwi', 'nkossiak@gmail.com', 'scrypt:32768:8:1$WdvLfLDXlSlWflJw$86dc57212534ce3e15e875dfc3aeccf004a0fc77e0288d19df1e110fcaf613427c8159159f84cacef0c5028693d1160aa06c98e5707383bc8cf98c8b1d514c25', '2026-04-27 23:31:24'),
(2, 'BahBah', 'bigB@gmail.com', 'scrypt:32768:8:1$RGuikREsZ8BzQUli$974d2575403f978d3082c94def507f1757a7883858e2a79361ecb43a21eea46f14ecbf9944c1e4967a66eab73866489596c8ba3ee31cfb33ce898ac0b11023c7', '2026-04-28 00:42:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `consoles`
--
ALTER TABLE `consoles`
  ADD PRIMARY KEY (`console_id`),
  ADD UNIQUE KEY `console_name` (`console_name`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`game_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `console_id` (`console_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `consoles`
--
ALTER TABLE `consoles`
  MODIFY `console_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `game_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `games_ibfk_2` FOREIGN KEY (`console_id`) REFERENCES `consoles` (`console_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
