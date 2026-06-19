@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <h1 style="font-weight: 600; letter-spacing: -0.5px;">Dashboard Overview<small style="font-weight: 400; opacity: 0.7;">System Information</small></h1>
    <ol class="breadcrumb" style="background: transparent;">
        <li><a href="{{ route('admin.index') }}" style="color: #6366f1;">Admin</a></li>
        <li class="active" style="color: #64748b;">Overview</li>
    </ol>
@endsection

@section('content')
<style>
    .modern-box {
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: none;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .modern-box:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        background: rgba(22, 163, 74, 0.2);
        color: #4ade80;
        margin-left: 10px;
    }
    .status-badge.danger {
        background: rgba(220, 38, 38, 0.2);
        color: #f87171;
    }
    .version-code {
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 8px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 13px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
        text-decoration: none !important;
        color: white;
        border: none;
        width: 100%;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
    }
    .action-btn::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15);
        color: white;
    }
    .action-btn:hover::after {
        opacity: 1;
    }
    .btn-discord { background: linear-gradient(135deg, #5865F2, #4752C4); }
    .btn-docs { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
    .btn-github { background: linear-gradient(135deg, #334155, #0f172a); }
    .btn-support { background: linear-gradient(135deg, #10b981, #059669); }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="box modern-box box-success">
            <div class="box-header with-border" style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <i class="fa fa-server" style="color: #6366f1; margin-right: 10px; font-size: 18px;"></i>
                <h3 class="box-title" style="font-weight: 600; font-size: 16px;">System Information</h3>
                <span class="status-badge"><i class="fa fa-check-circle" style="margin-right: 4px;"></i> System Optimal</span>
            </div>
            <div class="box-body" style="padding: 24px; font-size: 15px; line-height: 1.6;">
                You are running <strong>zzamcode panel</strong> version <span class="version-code">{{ config('app.version') }}</span>. Your panel is currently up-to-date and running perfectly!
            </div>
        </div>
    </div>
</div>
<div class="row" style="margin-top: 10px;">
    <div class="col-xs-12 col-md-3" style="margin-bottom: 15px;">
        <a href="https://discord.gg/" target="_blank" class="action-btn btn-discord">
            <i class="fa fa-comments" style="font-size: 16px;"></i> Get Help (Discord)
        </a>
    </div>
    <div class="col-xs-12 col-md-3" style="margin-bottom: 15px;">
        <a href="https://transaksikita.com" target="_blank" class="action-btn btn-docs">
            <i class="fa fa-credit-card" style="font-size: 16px;"></i> Payment Gateway
        </a>
    </div>
    <div class="col-xs-12 col-md-3" style="margin-bottom: 15px;">
        <a href="https://github.com/muhammadtsaqf" target="_blank" class="action-btn btn-github">
            <i class="fa fa-github" style="font-size: 16px;"></i> Our GitHub
        </a>
    </div>
    <div class="col-xs-12 col-md-3" style="margin-bottom: 15px;">
        <a href="https://transaksikita.com" target="_blank" class="action-btn btn-support">
            <i class="fa fa-heart" style="font-size: 16px;"></i> Support Us
        </a>
    </div>
</div>
@endsection
