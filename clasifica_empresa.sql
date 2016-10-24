-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 24-10-2016 a las 02:37:17
-- Versión del servidor: 10.1.16-MariaDB
-- Versión de PHP: 7.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `clasifica_empresa`
--
CREATE DATABASE IF NOT EXISTS `clasifica_empresa` DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish_ci;
USE `clasifica_empresa`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `ID` int(6) UNSIGNED NOT NULL,
  `nombre_empresa` varchar(50) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `misVotos`
--
CREATE TABLE `misVotos` (
`ID` int(6) unsigned
,`nombre_empresa` varchar(50)
,`IDempresa` int(6) unsigned
,`puntuacion` int(2)
,`DNIvotante` int(8) unsigned
,`Borrado` tinyint(1)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ranking`
--
CREATE TABLE `ranking` (
`nombre` varchar(50)
,`puntuacion` decimal(36,4)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `votante`
--

CREATE TABLE `votante` (
  `DNI` int(8) UNSIGNED NOT NULL,
  `contraseña` varchar(30) COLLATE utf8_spanish_ci NOT NULL,
  `nombre` varchar(30) COLLATE utf8_spanish_ci NOT NULL,
  `apellidos` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `email` varchar(50) COLLATE utf8_spanish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `voto`
--

CREATE TABLE `voto` (
  `IDempresa` int(6) UNSIGNED NOT NULL,
  `puntuacion` int(2) NOT NULL,
  `DNIvotante` int(8) UNSIGNED NOT NULL,
  `Borrado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura para la vista `misVotos`
--
DROP TABLE IF EXISTS `misVotos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `misVotos`  AS  select `empresa`.`ID` AS `ID`,`empresa`.`nombre_empresa` AS `nombre_empresa`,`voto`.`IDempresa` AS `IDempresa`,`voto`.`puntuacion` AS `puntuacion`,`voto`.`DNIvotante` AS `DNIvotante`,`voto`.`Borrado` AS `Borrado` from (`empresa` join `voto` on((`empresa`.`ID` = `voto`.`IDempresa`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `ranking`
--
DROP TABLE IF EXISTS `ranking`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ranking`  AS  select `empresa`.`nombre_empresa` AS `nombre`,(sum(`voto`.`puntuacion`) / count(`voto`.`IDempresa`)) AS `puntuacion` from (`voto` join `empresa` on((`voto`.`IDempresa` = `empresa`.`ID`))) where (`voto`.`Borrado` = 1) group by `voto`.`IDempresa` order by (sum(`voto`.`puntuacion`) / count(`voto`.`IDempresa`)) desc ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `votante`
--
ALTER TABLE `votante`
  ADD PRIMARY KEY (`DNI`);

--
-- Indices de la tabla `voto`
--
ALTER TABLE `voto`
  ADD PRIMARY KEY (`IDempresa`,`DNIvotante`),
  ADD KEY `DNIvotante` (`DNIvotante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `ID` int(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `voto`
--
ALTER TABLE `voto`
  ADD CONSTRAINT `voto_ibfk_1` FOREIGN KEY (`IDempresa`) REFERENCES `empresa` (`ID`),
  ADD CONSTRAINT `voto_ibfk_2` FOREIGN KEY (`DNIvotante`) REFERENCES `votante` (`DNI`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
