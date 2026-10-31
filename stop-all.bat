@echo off
chcp 65001 >nul
title Dừng Hệ thống E-Learning
echo Đang tắt tất cả dịch vụ E-Learning (MinIO, Backend, Reverb, Frontend)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"
