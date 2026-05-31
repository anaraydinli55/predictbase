'use client';

import { useState, useEffect } from 'react';

// --- TİPLER ---
interface GoalEvent {
  player: string;
  minute: number;
}

interface Match {
  id: number;
  externalId: string;
  date: string;
  timestamp: number;
  stage: string;
  home: { n: string; c: string; f: string };
  away: { n: string; c: string; f: string };
  result: string | null;
  events: GoalEvent[];
  pool: number;    // Dinamik Havuz
  tickets: number; // Dinamik Bilet
  players: number; // Dinamik Oyuncu
}

interface Prediction {
  matchId: number;
  pred: string;
  status: 'win' | 'lost' | 'pend';
  payout: number;
}

// --- MAÇ LİSTESİ OLUŞTURUCU (104 MAÇ) ---
const generate104Matches = (): Match[] => {
    const baseData = [
        { id: 1, ext: "74321", date: 'Thursday 11 June 2026', time: '23:00', home: { n: 'Mexico', c: 'MEX', f: '🇲🇽' }, away: { n: 'South Africa', c: 'RSA', f: '🇿🇦' }, stage: 'Group A' },
        { id: 2, ext: "74322", date: 'Friday 12 June 2026', time: '06:00', home: { n: 'Korea Rep.', c: 'KOR', f: '🇰🇷' }, away: { n: 'Czechia', c: 'CZE', f: '🇨🇿' }, stage: 'Group A' },
        { id: 3, ext: "74323", date: 'Friday 12 June 2026', time: '23:00', home: { n: 'Canada', c: 'CAN', f: '🇨🇦' }, away: { n: 'Bosnia', c: 'BIH', f: '🇧🇦' }, stage: 'Group B' },
        { id: 4, ext: "74324", date: 'Saturday 13 June 2026', time: '05:00', home: { n: 'USA', c: 'USA', f: '🇺🇸' }, away: { n: 'Paraguay', c: 'PAR', f: '🇵🇾' }, stage: 'Group D' },
 { id: 5, date: 'Sat 13 June 2026', time: '23:00', stage: 'Group B', stadium: 'San Francisco', home: { n: 'Qatar', c: 'QAT', f: '🇶🇦' }, away: { n: 'Switzerland', c: 'SUI', f: '🇨🇭' } },
    { id: 6, date: 'Sun 14 June 2026', time: '02:00', stage: 'Group C', stadium: 'New York/NJ', home: { n: 'Brazil', c: 'BRA', f: '🇧🇷' }, away: { n: 'Morocco', c: 'MAR', f: '🇲🇦' } },
    { id: 7, date: 'Sun 14 June 2026', time: '05:00', stage: 'Group C', stadium: 'Boston', home: { n: 'Haiti', c: 'HAI', f: '🇭🇹' }, away: { n: 'Scotland', c: 'SCO', f: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' } },
    { id: 8, date: 'Sun 14 June 2026', time: '08:00', stage: 'Group D', stadium: 'Vancouver', home: { n: 'Australia', c: 'AUS', f: '🇦🇺' }, away: { n: 'Türkiye', c: 'TUR', f: '🇹🇷' } },
    { id: 9, date: 'Sun 14 June 2026', time: '21:00', stage: 'Group E', stadium: 'Houston', home: { n: 'Germany', c: 'GER', f: '🇩🇪' }, away: { n: 'Curaçao', c: 'CUW', f: '🇨🇼' } },
    { id: 10, date: 'Mon 15 June 2026', time: '00:00', stage: 'Group F', stadium: 'Dallas', home: { n: 'Netherlands', c: 'NED', f: '🇳🇱' }, away: { n: 'Japan', c: 'JPN', f: '🇯🇵' } },
    { id: 11, date: 'Mon 15 June 2026', time: '03:00', stage: 'Group E', stadium: 'Philadelphia', home: { n: "Côte d'Ivoire", c: 'CIV', f: '🇨🇮' }, away: { n: 'Ecuador', c: 'ECU', f: '🇪🇨' } },
    { id: 12, date: 'Mon 15 June 2026', time: '06:00', stage: 'Group F', stadium: 'Monterrey', home: { n: 'Sweden', c: 'SWE', f: '🇸🇪' }, away: { n: 'Tunisia', c: 'TUN', f: '🇹🇳' } },
    { id: 13, date: 'Mon 15 June 2026', time: '20:00', stage: 'Group H', stadium: 'Atlanta', home: { n: 'Spain', c: 'ESP', f: '🇪🇸' }, away: { n: 'Cabo Verde', c: 'CPV', f: '🇨🇻' } },
    { id: 14, date: 'Mon 15 June 2026', time: '23:00', stage: 'Group G', stadium: 'Seattle', home: { n: 'Belgium', c: 'BEL', f: '🇧🇪' }, away: { n: 'Egypt', c: 'EGY', f: '🇪🇬' } },
    { id: 15, date: 'Tue 16 June 2026', time: '02:00', stage: 'Group H', stadium: 'Miami', home: { n: 'Saudi Arabia', c: 'KSA', f: '🇸🇦' }, away: { n: 'Uruguay', c: 'URU', f: '🇺🇾' } },
    { id: 16, date: 'Tue 16 June 2026', time: '05:00', stage: 'Group G', stadium: 'Los Angeles', home: { n: 'IR Iran', c: 'IRN', f: '🇮🇷' }, away: { n: 'New Zealand', c: 'NZL', f: '🇳🇿' } },
    { id: 17, date: 'Tue 16 June 2026', time: '23:00', stage: 'Group I', stadium: 'New York/NJ', home: { n: 'France', c: 'FRA', f: '🇫🇷' }, away: { n: 'Senegal', c: 'SEN', f: '🇸🇳' } },
    { id: 18, date: 'Wed 17 June 2026', time: '02:00', stage: 'Group I', stadium: 'Boston', home: { n: 'Iraq', c: 'IRQ', f: '🇮🇶' }, away: { n: 'Norway', c: 'NOR', f: '🇳🇴' } },
    { id: 19, date: 'Wed 17 June 2026', time: '05:00', stage: 'Group J', stadium: 'Kansas City', home: { n: 'Argentina', c: 'ARG', f: '🇦🇷' }, away: { n: 'Algeria', c: 'ALG', f: '🇩🇿' } },
    { id: 20, date: 'Wed 17 June 2026', time: '08:00', stage: 'Group J', stadium: 'San Francisco', home: { n: 'Austria', c: 'AUT', f: '🇦🇹' }, away: { n: 'Jordan', c: 'JOR', f: '🇯🇴' } },
    { id: 21, date: 'Wed 17 June 2026', time: '21:00', stage: 'Group K', stadium: 'Houston', home: { n: 'Portugal', c: 'POR', f: '🇵🇹' }, away: { n: 'Congo DR', c: 'COD', f: '🇨🇩' } },
    { id: 22, date: 'Thu 18 June 2026', time: '00:00', stage: 'Group L', stadium: 'Dallas', home: { n: 'England', c: 'ENG', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, away: { n: 'Croatia', c: 'CRO', f: '🇭🇷' } },
    { id: 23, date: 'Thu 18 June 2026', time: '03:00', stage: 'Group L', stadium: 'Toronto', home: { n: 'Ghana', c: 'GHA', f: '🇬🇭' }, away: { n: 'Panama', c: 'PAN', f: '🇵🇦' } },
    { id: 24, date: 'Thu 18 June 2026', time: '06:00', stage: 'Group K', stadium: 'Mexico City', home: { n: 'Uzbekistan', c: 'UZB', f: '🇺🇿' }, away: { n: 'Colombia', c: 'COL', f: '🇨🇴' } },
    { id: 25, date: 'Thu 18 June 2026', time: '20:00', stage: 'Group A', stadium: 'Atlanta', home: { n: 'Czechia', c: 'CZE', f: '🇨🇿' }, away: { n: 'South Africa', c: 'RSA', f: '🇿🇦' } },
    { id: 26, date: 'Thu 18 June 2026', time: '23:00', stage: 'Group B', stadium: 'Los Angeles', home: { n: 'Switzerland', c: 'SUI', f: '🇨🇭' }, away: { n: 'Bosnia', c: 'BIH', f: '🇧🇦' } },

    // --- HAZİRAN 19-28 ---
    { id: 27, date: 'Fri 19 June 2026', time: '02:00', stage: 'Group B', stadium: 'Vancouver', home: { n: 'Canada', c: 'CAN', f: '🇨🇦' }, away: { n: 'Qatar', c: 'QAT', f: '🇶🇦' } },
    { id: 28, date: 'Fri 19 June 2026', time: '05:00', stage: 'Group A', stadium: 'Guadalajara', home: { n: 'Mexico', c: 'MEX', f: '🇲🇽' }, away: { n: 'Korea Rep.', c: 'KOR', f: '🇰🇷' } },
    { id: 29, date: 'Fri 19 June 2026', time: '23:00', stage: 'Group D', stadium: 'Seattle', home: { n: 'USA', c: 'USA', f: '🇺🇸' }, away: { n: 'Australia', c: 'AUS', f: '🇦🇺' } },
    { id: 30, date: 'Sat 20 June 2026', time: '02:00', stage: 'Group C', stadium: 'Boston', home: { n: 'Scotland', c: 'SCO', f: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, away: { n: 'Morocco', c: 'MAR', f: '🇲🇦' } },
    { id: 31, date: 'Sat 20 June 2026', time: '04:30', stage: 'Group C', stadium: 'Philadelphia', home: { n: 'Brazil', c: 'BRA', f: '🇧🇷' }, away: { n: 'Haiti', c: 'HAI', f: '🇭🇹' } },
    { id: 32, date: 'Sat 20 June 2026', time: '07:00', stage: 'Group D', stadium: 'San Francisco', home: { n: 'Türkiye', c: 'TUR', f: '🇹🇷' }, away: { n: 'Paraguay', c: 'PAR', f: '🇵🇾' } },
    { id: 33, date: 'Sat 20 June 2026', time: '21:00', stage: 'Group F', stadium: 'Houston', home: { n: 'Netherlands', c: 'NED', f: '🇳🇱' }, away: { n: 'Sweden', c: 'SWE', f: '🇸🇪' } },
    { id: 34, date: 'Sun 21 June 2026', time: '00:00', stage: 'Group E', stadium: 'Toronto', home: { n: 'Germany', c: 'GER', f: '🇩🇪' }, away: { n: 'Côte d’Ivoire', c: 'CIV', f: '🇨🇮' } },
    { id: 35, date: 'Sun 21 June 2026', time: '04:00', stage: 'Group E', stadium: 'Kansas City', home: { n: 'Ecuador', c: 'ECU', f: '🇪🇨' }, away: { n: 'Curaçao', c: 'CUW', f: '🇨🇼' } },
    { id: 36, date: 'Sun 21 June 2026', time: '08:00', stage: 'Group F', stadium: 'Monterrey', home: { n: 'Tunisia', c: 'TUN', f: '🇹🇳' }, away: { n: 'Japan', c: 'JPN', f: '🇯🇵' } },
    { id: 37, date: 'Sun 21 June 2026', time: '20:00', stage: 'Group H', stadium: 'Atlanta', home: { n: 'Spain', c: 'ESP', f: '🇪🇸' }, away: { n: 'Saudi Arabia', c: 'KSA', f: '🇸🇦' } },
    { id: 38, date: 'Sun 21 June 2026', time: '23:00', stage: 'Group G', stadium: 'Los Angeles', home: { n: 'Belgium', c: 'BEL', f: '🇧🇪' }, away: { n: 'IR Iran', c: 'IRN', f: '🇮🇷' } },
    { id: 39, date: 'Mon 22 June 2026', time: '02:00', stage: 'Group H', stadium: 'Miami', home: { n: 'Uruguay', c: 'URU', f: '🇺🇾' }, away: { n: 'Cabo Verde', c: 'CPV', f: '🇨🇻' } },
    { id: 40, date: 'Mon 22 June 2026', time: '05:00', stage: 'Group G', stadium: 'Vancouver', home: { n: 'New Zealand', c: 'NZL', f: '🇳🇿' }, away: { n: 'Egypt', c: 'EGY', f: '🇪🇬' } },
    { id: 41, date: 'Mon 22 June 2026', time: '21:00', stage: 'Group J', stadium: 'Dallas', home: { n: 'Argentina', c: 'ARG', f: '🇦🇷' }, away: { n: 'Austria', c: 'AUT', f: '🇦🇹' } },
    { id: 42, date: 'Tue 23 June 2026', time: '01:00', stage: 'Group I', stadium: 'Philadelphia', home: { n: 'France', c: 'FRA', f: '🇫🇷' }, away: { n: 'Iraq', c: 'IRQ', f: '🇮🇶' } },
    { id: 43, date: 'Tue 23 June 2026', time: '04:00', stage: 'Group I', stadium: 'New York/NJ', home: { n: 'Norway', c: 'NOR', f: '🇳🇴' }, away: { n: 'Senegal', c: 'SEN', f: '🇸🇳' } },
    { id: 44, date: 'Tue 23 June 2026', time: '07:00', stage: 'Group J', stadium: 'San Francisco', home: { n: 'Jordan', c: 'JOR', f: '🇯🇴' }, away: { n: 'Algeria', c: 'ALG', f: '🇩🇿' } },
    { id: 45, date: 'Tue 23 June 2026', time: '21:00', stage: 'Group K', stadium: 'Houston', home: { n: 'Portugal', c: 'POR', f: '🇵🇹' }, away: { n: 'Uzbekistan', c: 'UZB', f: '🇺🇿' } },
    { id: 46, date: 'Wed 24 June 2026', time: '00:00', stage: 'Group L', stadium: 'Boston', home: { n: 'England', c: 'ENG', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, away: { n: 'Ghana', c: 'GHA', f: '🇬🇭' } },
    { id: 47, date: 'Wed 24 June 2026', time: '03:00', stage: 'Group L', stadium: 'Toronto', home: { n: 'Panama', c: 'PAN', f: '🇵🇦' }, away: { n: 'Croatia', c: 'CRO', f: '🇭🇷' } },
    { id: 48, date: 'Wed 24 June 2026', time: '06:00', stage: 'Group K', stadium: 'Guadalajara', home: { n: 'Colombia', c: 'COL', f: '🇨🇴' }, away: { n: 'Congo DR', c: 'COD', f: '🇨🇩' } },
    { id: 49, date: 'Wed 24 June 2026', time: '23:00', stage: 'Group B', stadium: 'Vancouver', home: { n: 'Switzerland', c: 'SUI', f: '🇨🇭' }, away: { n: 'Canada', c: 'CAN', f: '🇨🇦' } },
    { id: 50, date: 'Wed 24 June 2026', time: '23:00', stage: 'Group B', stadium: 'Seattle', home: { n: 'Bosnia', c: 'BIH', f: '🇧🇦' }, away: { n: 'Qatar', c: 'QAT', f: '🇶🇦' } },
    { id: 51, date: 'Thu 25 June 2026', time: '02:00', stage: 'Group C', stadium: 'Miami', home: { n: 'Scotland', c: 'SCO', f: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, away: { n: 'Brazil', c: 'BRA', f: '🇧🇷' } },
    { id: 52, date: 'Thu 25 June 2026', time: '02:00', stage: 'Group C', stadium: 'Atlanta', home: { n: 'Morocco', c: 'MAR', f: '🇲🇦' }, away: { n: 'Haiti', c: 'HAI', f: '🇭🇹' } },
    { id: 53, date: 'Thu 25 June 2026', time: '05:00', stage: 'Group A', stadium: 'Mexico City', home: { n: 'Czechia', c: 'CZE', f: '🇨🇿' }, away: { n: 'Mexico', c: 'MEX', f: '🇲🇽' } },
    { id: 54, date: 'Thu 25 June 2026', time: '05:00', stage: 'Group A', stadium: 'Monterrey', home: { n: 'South Africa', c: 'RSA', f: '🇿🇦' }, away: { n: 'Korea Rep.', c: 'KOR', f: '🇰🇷' } },
    { id: 55, date: 'Fri 26 June 2026', time: '00:00', stage: 'Group E', stadium: 'Philadelphia', home: { n: 'Curaçao', c: 'CUW', f: '🇨🇼' }, away: { n: 'Côte d’Ivoire', c: 'CIV', f: '🇨🇮' } },
    { id: 56, date: 'Fri 26 June 2026', time: '00:00', stage: 'Group E', stadium: 'New York/NJ', home: { n: 'Ecuador', c: 'ECU', f: '🇪🇨' }, away: { n: 'Germany', c: 'GER', f: '🇩🇪' } },
    { id: 57, date: 'Fri 26 June 2026', time: '03:00', stage: 'Group F', stadium: 'Dallas', home: { n: 'Japan', c: 'JPN', f: '🇯🇵' }, away: { n: 'Sweden', c: 'SWE', f: '🇸🇪' } },
    { id: 58, date: 'Fri 26 June 2026', time: '03:00', stage: 'Group F', stadium: 'Kansas City', home: { n: 'Tunisia', c: 'TUN', f: '🇹🇳' }, away: { n: 'Netherlands', c: 'NED', f: '🇳🇱' } },
    { id: 59, date: 'Fri 26 June 2026', time: '06:00', stage: 'Group D', stadium: 'Los Angeles', home: { n: 'Türkiye', c: 'TUR', f: '🇹🇷' }, away: { n: 'USA', c: 'USA', f: '🇺🇸' } },
    { id: 60, date: 'Fri 26 June 2026', time: '06:00', stage: 'Group D', stadium: 'San Francisco', home: { n: 'Paraguay', c: 'PAR', f: '🇵🇾' }, away: { n: 'Australia', c: 'AUS', f: '🇦🇺' } },
    { id: 61, date: 'Fri 26 June 2026', time: '23:00', stage: 'Group I', stadium: 'Boston', home: { n: 'Norway', c: 'NOR', f: '🇳🇴' }, away: { n: 'France', c: 'FRA', f: '🇫🇷' } },
    { id: 62, date: 'Fri 26 June 2026', time: '23:00', stage: 'Group I', stadium: 'Toronto', home: { n: 'Senegal', c: 'SEN', f: '🇸🇳' }, away: { n: 'Iraq', c: 'IRQ', f: '🇮🇶' } },
    { id: 63, date: 'Sat 27 June 2026', time: '04:00', stage: 'Group H', stadium: 'Houston', home: { n: 'Cabo Verde', c: 'CPV', f: '🇨🇻' }, away: { n: 'Saudi Arabia', c: 'KSA', f: '🇸🇦' } },
    { id: 64, date: 'Sat 27 June 2026', time: '04:00', stage: 'Group H', stadium: 'Guadalajara', home: { n: 'Uruguay', c: 'URU', f: '🇺🇾' }, away: { n: 'Spain', c: 'ESP', f: '🇪🇸' } },
    { id: 65, date: 'Sat 27 June 2026', time: '07:00', stage: 'Group G', stadium: 'Seattle', home: { n: 'Egypt', c: 'EGY', f: '🇪🇬' }, away: { n: 'IR Iran', c: 'IRN', f: '🇮🇷' } },
    { id: 66, date: 'Sat 27 June 2026', time: '07:00', stage: 'Group G', stadium: 'Vancouver', home: { n: 'New Zealand', c: 'NZL', f: '🇳🇿' }, away: { n: 'Belgium', c: 'BEL', f: '🇧🇪' } },
    { id: 67, date: 'Sun 28 June 2026', time: '01:00', stage: 'Group L', stadium: 'New York/NJ', home: { n: 'Panama', c: 'PAN', f: '🇵🇦' }, away: { n: 'England', c: 'ENG', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
    { id: 68, date: 'Sun 28 June 2026', time: '01:00', stage: 'Group L', stadium: 'Philadelphia', home: { n: 'Croatia', c: 'CRO', f: '🇭🇷' }, away: { n: 'Ghana', c: 'GHA', f: '🇬🇭' } },
    { id: 69, date: 'Sun 28 June 2026', time: '03:30', stage: 'Group K', stadium: 'Miami', home: { n: 'Colombia', c: 'COL', f: '🇨🇴' }, away: { n: 'Portugal', c: 'POR', f: '🇵🇹' } },
    { id: 70, date: 'Sun 28 June 2026', time: '03:30', stage: 'Group K', stadium: 'Atlanta', home: { n: 'Congo DR', c: 'COD', f: '🇨🇩' }, away: { n: 'Uzbekistan', c: 'UZB', f: '🇺🇿' } },
    { id: 71, date: 'Sun 28 June 2026', time: '06:00', stage: 'Group J', stadium: 'Kansas City', home: { n: 'Algeria', c: 'ALG', f: '🇩🇿' }, away: { n: 'Austria', c: 'AUT', f: '🇦🇹' } },
    { id: 72, date: 'Sun 28 June 2026', time: '06:00', stage: 'Group J', stadium: 'Dallas', home: { n: 'Jordan', c: 'JOR', f: '🇯🇴' }, away: { n: 'Argentina', c: 'ARG', f: '🇦🇷' } },

    // --- ROUND OF 32 ---
    { id: 73, date: 'Sun 28 June 2026', time: '23:00', stage: 'Round of 32', stadium: 'Los Angeles', home: { n: '2A', c: '2A', f: '🏳️' }, away: { n: '2B', c: '2B', f: '🏳️' } },
    { id: 74, date: 'Mon 29 June 2026', time: '21:00', stage: 'Round of 32', stadium: 'Houston', home: { n: '1C', c: '1C', f: '🏳️' }, away: { n: '2F', c: '2F', f: '🏳️' } },
    { id: 75, date: 'Tue 30 June 2026', time: '00:30', stage: 'Round of 32', stadium: 'Boston', home: { n: '1E', c: '1E', f: '🏳️' }, away: { n: '3ABCDF', c: '3RD', f: '🏳️' } },
    { id: 76, date: 'Tue 30 June 2026', time: '05:00', stage: 'Round of 32', stadium: 'Monterrey', home: { n: '1F', c: '1F', f: '🏳️' }, away: { n: '2C', c: '2C', f: '🏳️' } },
    { id: 77, date: 'Tue 30 June 2026', time: '21:00', stage: 'Round of 32', stadium: 'Dallas', home: { n: '2E', c: '2E', f: '🏳️' }, away: { n: '2I', c: '2I', f: '🏳️' } },
    { id: 78, date: 'Wed 01 July 2026', time: '01:00', stage: 'Round of 32', stadium: 'New York/NJ', home: { n: '1I', c: '1I', f: '🏳️' }, away: { n: '3CDFGH', c: '3RD', f: '🏳️' } },
    { id: 79, date: 'Wed 01 July 2026', time: '05:00', stage: 'Round of 32', stadium: 'Mexico City', home: { n: '1A', c: '1A', f: '🏳️' }, away: { n: '3CEFHI', c: '3RD', f: '🏳️' } },
    { id: 80, date: 'Wed 01 July 2026', time: '20:00', stage: 'Round of 32', stadium: 'Atlanta', home: { n: '1L', c: '1L', f: '🏳️' }, away: { n: '3EHIJK', c: '3RD', f: '🏳️' } },
    { id: 81, date: 'Thu 02 July 2026', time: '00:00', stage: 'Round of 32', stadium: 'Seattle', home: { n: '1G', c: '1G', f: '🏳️' }, away: { n: '3AEHIJ', c: '3RD', f: '🏳️' } },
    { id: 82, date: 'Thu 02 July 2026', time: '04:00', stage: 'Round of 32', stadium: 'San Francisco', home: { n: '1D', c: '1D', f: '🏳️' }, away: { n: '3BEFIJ', c: '3RD', f: '🏳️' } },
    { id: 83, date: 'Thu 02 July 2026', time: '23:00', stage: 'Round of 32', stadium: 'Los Angeles', home: { n: '1H', c: '1H', f: '🏳️' }, away: { n: '2J', c: '2J', f: '🏳️' } },
    { id: 84, date: 'Fri 03 July 2026', time: '03:00', stage: 'Round of 32', stadium: 'Toronto', home: { n: '2K', c: '2K', f: '🏳️' }, away: { n: '2L', c: '2L', f: '🏳️' } },
    { id: 85, date: 'Fri 03 July 2026', time: '07:00', stage: 'Round of 32', stadium: 'Vancouver', home: { n: '1B', c: '1B', f: '🏳️' }, away: { n: '3EFGIJ', c: '3RD', f: '🏳️' } },
    { id: 86, date: 'Fri 03 July 2026', time: '22:00', stage: 'Round of 32', stadium: 'Dallas', home: { n: '2D', c: '2D', f: '🏳️' }, away: { n: '2G', c: '2G', f: '🏳️' } },
    { id: 87, date: 'Sat 04 July 2026', time: '02:00', stage: 'Round of 32', stadium: 'Miami', home: { n: '1J', c: '1J', f: '🏳️' }, away: { n: '2H', c: '2H', f: '🏳️' } },
    { id: 88, date: 'Sat 04 July 2026', time: '05:30', stage: 'Round of 32', stadium: 'Kansas City', home: { n: '1K', c: '1K', f: '🏳️' }, away: { n: '3DEIJL', c: '3RD', f: '🏳️' } },

    // --- ROUND OF 16 ---
    { id: 89, date: 'Sat 04 July 2026', time: '21:00', stage: 'Round of 16', stadium: 'Houston', home: { n: 'W73', c: 'W73', f: '?' }, away: { n: 'W75', c: 'W75', f: '?' } },
    { id: 90, date: 'Sun 05 July 2026', time: '01:00', stage: 'Round of 16', stadium: 'Philadelphia', home: { n: 'W74', c: 'W74', f: '?' }, away: { n: 'W77', c: 'W77', f: '?' } },
    { id: 91, date: 'Mon 06 July 2026', time: '00:00', stage: 'Round of 16', stadium: 'New York/NJ', home: { n: 'W76', c: 'W76', f: '?' }, away: { n: 'W78', c: 'W78', f: '?' } },
    { id: 92, date: 'Mon 06 July 2026', time: '04:00', stage: 'Round of 16', stadium: 'Mexico City', home: { n: 'W79', c: 'W79', f: '?' }, away: { n: 'W80', c: 'W80', f: '?' } },
    { id: 93, date: 'Mon 06 July 2026', time: '23:00', stage: 'Round of 16', stadium: 'Dallas', home: { n: 'W83', c: 'W83', f: '?' }, away: { n: 'W84', c: 'W84', f: '?' } },
    { id: 94, date: 'Tue 07 July 2026', time: '04:00', stage: 'Round of 16', stadium: 'Seattle', home: { n: 'W81', c: 'W81', f: '?' }, away: { n: 'W82', c: 'W82', f: '?' } },
    { id: 95, date: 'Tue 07 July 2026', time: '20:00', stage: 'Round of 16', stadium: 'Atlanta', home: { n: 'W86', c: 'W86', f: '?' }, away: { n: 'W88', c: 'W88', f: '?' } },
    { id: 96, date: 'Wed 08 July 2026', time: '00:00', stage: 'Round of 16', stadium: 'Vancouver', home: { n: 'W85', c: 'W85', f: '?' }, away: { n: 'W87', c: 'W87', f: '?' } },

    // --- QUARTER FINALS ---
    { id: 97, date: 'Fri 10 July 2026', time: '00:00', stage: 'Quarter-final', stadium: 'Boston', home: { n: 'W89', c: 'W89', f: '?' }, away: { n: 'W90', c: 'W90', f: '?' } },
    { id: 98, date: 'Fri 10 July 2026', time: '23:00', stage: 'Quarter-final', stadium: 'Los Angeles', home: { n: 'W93', c: 'W93', f: '?' }, away: { n: 'W94', c: 'W94', f: '?' } },
    { id: 99, date: 'Sun 12 July 2026', time: '01:00', stage: 'Quarter-final', stadium: 'Miami', home: { n: 'W91', c: 'W91', f: '?' }, away: { n: 'W92', c: 'W92', f: '?' } },
    { id: 100, date: 'Sun 12 July 2026', time: '05:00', stage: 'Quarter-final', stadium: 'Kansas City', home: { n: 'W95', c: 'W95', f: '?' }, away: { n: 'W96', c: 'W96', f: '?' } },

    // --- SEMI FINALS ---
    { id: 101, date: 'Tue 14 July 2026', time: '23:00', stage: 'Semi-final', stadium: 'Dallas', home: { n: 'W97', c: 'W97', f: '?' }, away: { n: 'W98', c: 'W98', f: '?' } },
    { id: 102, date: 'Wed 15 July 2026', time: '23:00', stage: 'Semi-final', stadium: 'Atlanta', home: { n: 'W99', c: 'W99', f: '?' }, away: { n: 'W100', c: 'W100', f: '?' } },

    // --- FINALS ---
    { id: 103, date: 'Sun 18 July 2026', time: '01:00', stage: 'Third Place', stadium: 'Miami', home: { n: 'RU101', c: 'RU1', f: '🥉' }, away: { n: 'RU102', c: 'RU2', f: '🥉' } },
    { id: 104, date: 'Sun 19 July 2026', time: '23:00', stage: 'FINAL', stadium: 'New York/NJ', home: { n: 'W101', c: 'W101', f: '🏆' }, away: { n: 'W102', c: 'W102', f: '🏆' } }
    ];

    const matches: Match[] = [];
    for (let i = 1; i <= 104; i++) {
        const template = baseData[(i - 1) % baseData.length];
        matches.push({
            id: i,
            externalId: template.ext + i,
            date: template.date,
            timestamp: new Date('2026-06-11T23:00:00Z').getTime() + (i * 3600000), // Maçları ardışık saatlere yayar
            stage: i <= 72 ? `First Stage · Match ${i}` : i <= 88 ? 'Round of 32' : i <= 96 ? 'Round of 16' : 'Knockout Stage',
            home: template.home,
            away: template.away,
            result: null,
            events: [],
            pool: 0,
            tickets: 0,
            players: 0
        });
    }
    return matches;
};

export default function PredictBase() {
  const [activeTab, setActiveTab] = useState<'matches' | 'picks' | 'leaderboard'>('matches');
  const [matches, setMatches] = useState<Match[]>(generate104Matches());
  const [myPicks, setMyPicks] = useState<Prediction[]>([]);
  const [search, setSearch] = useState('');
  const [modalMatch, setModalMatch] = useState<Match | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  // --- API SORGULAMA ---
  useEffect(() => {
    const checkScores = async () => {
      const now = Date.now();
      const matchesToUpdate = matches.filter(m => !m.result && (now - m.timestamp) > (105 * 60 * 1000));

      for (const m of matchesToUpdate) {
        try {
          const res = await fetch(`/api/matches?matchId=${m.externalId}`);
          const data = await res.json();
          if (data.score) {
            setMatches(prev => prev.map(match => match.id === m.id ? { ...match, result: data.score, events: data.events } : match));
            setMyPicks(prev => prev.map(p => p.matchId === m.id && p.status === 'pend' ? { ...p, status: p.pred === data.score ? 'win' : 'lost', payout: p.pred === data.score ? 30 : 0 } : p));
          }
        } catch (e) { console.error("Score fetch failed"); }
      }
    };
    const interval = setInterval(checkScores, 600000);
    return () => clearInterval(interval);
  }, [matches]);

  // --- TAHMİN YAPMA FONKSİYONU (İstatistikleri Arttırır) ---
  const handleDeployPrediction = (matchId: number, predictionScore: string) => {
    // 1. Maç istatistiklerini güncelle (Yerel State)
    setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
            return {
                ...m,
                pool: m.pool + 2,      // +2 USDC ekle
                tickets: m.tickets + 1, // +1 Bilet ekle
                players: m.players + 1  // +1 Oyuncu ekle
            };
        }
        return m;
    }));

    // 2. Kullanıcı dashboard'una ekle
    setMyPicks([{ matchId, pred: predictionScore, status: 'pend', payout: 0 }, ...myPicks]);
    setModalMatch(null);
  };

  const stats = {
    wins: myPicks.filter(p => p.status === 'win').length,
    lost: myPicks.filter(p => p.status === 'lost').length,
    pend: myPicks.filter(p => p.status === 'pend').length,
    earned: myPicks.reduce((s, p) => s + p.payout, 0)
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-[#00e87a]/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05070a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="font-black text-xl text-[#00e87a] tracking-tighter italic">⚽ PREDICTBASE</div>
            <span className="bg-[#4f8eff]/10 text-[#4f8eff] border border-[#4f8eff]/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Base Chain</span>
        </div>
        <button 
          onClick={() => setWalletAddr(walletAddr ? null : '0x7a2f...1c8d')}
          className="bg-[#00e87a]/5 border border-[#00e87a]/30 px-3 py-1.5 rounded-xl flex items-center gap-2"
        >
            <span className="text-[#00e87a] text-[10px] font-black uppercase">{walletAddr || 'Connect Wallet'}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${walletAddr ? 'bg-[#00e87a] animate-pulse' : 'bg-gray-600'}`}></div>
        </button>
      </nav>

      {/* TABS */}
      <div className="mt-[56px] flex px-4 border-b border-white/5 sticky top-[56px] bg-[#05070a] z-40">
        {(['matches', 'picks', 'leaderboard'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-[#00e87a] text-[#00e87a]' : 'border-transparent text-gray-500'}`}>
                {tab === 'picks' ? 'My Dashboard' : tab === 'leaderboard' ? 'Top' : tab}
            </button>
        ))}
      </div>

      <main className="p-4 max-w-xl mx-auto pt-6">
        
        {/* MATCHES VIEW */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <input onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-[#00e87a]" placeholder="Search teams..." />
            {matches.filter(m => m.home.n.toLowerCase().includes(search.toLowerCase()) || m.away.n.toLowerCase().includes(search.toLowerCase())).map(m => (
              <div key={m.id} className="bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-[32px] p-6 shadow-2xl">
                <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase mb-4 tracking-widest">
                  <span>{m.stage}</span>
                  <span className={m.result ? 'text-gray-700' : 'text-[#00e87a]'}>{m.date}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center w-1/3">
                    <p className="text-4xl mb-2">{m.home.f}</p>
                    <p className="text-[10px] font-black uppercase">{m.home.n}</p>
                  </div>
                  {m.result ? (
                    <div className="text-center"><p className="text-3xl font-black text-[#00e87a] font-mono">{m.result}</p></div>
                  ) : (
                    <div className="text-xl font-black text-white/5 italic">VS</div>
                  )}
                  <div className="text-center w-1/3">
                    <p className="text-4xl mb-2">{m.away.f}</p>
                    <p className="text-[10px] font-black uppercase">{m.away.n}</p>
                  </div>
                </div>

                {/* STATS PANEL (0'dan Başlayan Değerler) */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-black/20 p-2 rounded-xl text-center">
                        <p className="text-xs font-black">{m.pool} USDC</p>
                        <p className="text-[7px] text-gray-500 uppercase font-bold">Pool</p>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl text-center">
                        <p className="text-xs font-black">{m.tickets}</p>
                        <p className="text-[7px] text-gray-500 uppercase font-bold">Tickets</p>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl text-center">
                        <p className="text-xs font-black">{m.players}</p>
                        <p className="text-[7px] text-gray-500 uppercase font-bold">Players</p>
                    </div>
                </div>

                {!m.result && (
                    <button onClick={() => setModalMatch(m)} className="w-full bg-[#00e87a] text-[#03100a] font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:brightness-110 transition-all">Predict</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {activeTab === 'picks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-[#00e87a] font-black text-xl">{stats.wins}</p><p className="text-[7px] text-gray-500 uppercase font-bold tracking-widest mt-1">Wins</p></div>
              <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-red-500 font-black text-xl">{stats.lost}</p><p className="text-[7px] text-gray-500 uppercase font-bold tracking-widest mt-1">Lost</p></div>
              <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-yellow-500 font-black text-xl">{stats.pend}</p><p className="text-[7px] text-gray-500 uppercase font-bold tracking-widest mt-1">Pend</p></div>
              <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-white font-black text-xl">${stats.earned}</p><p className="text-[7px] text-gray-500 uppercase font-bold tracking-widest mt-1">Earned</p></div>
            </div>
            <div className="space-y-3">
              {myPicks.map((p, i) => {
                const m = matches.find(match => match.id === p.matchId);
                return (
                  <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-[24px] flex justify-between items-center shadow-lg">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{m?.home.n} vs {m?.away.n}</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">Pred: <span className="text-white">{p.pred}</span></p>
                    </div>
                    <div className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${p.status === 'win' ? 'bg-[#00e87a]/10 text-[#00e87a]' : p.status === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>{p.status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOP VIEW */}
        {activeTab ===
