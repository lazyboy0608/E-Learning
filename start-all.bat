@echo off
chcp 65001 >nul
title Khởi động Hệ thống E-Learning
echo Đang khởi động toàn bộ dịch vụ E-Learning (Backend, Reverb, Frontend)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-all.ps1"
