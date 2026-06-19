@extends('layouts.admin')

@section('title')
    Payment Gateway Settings
@endsection

@section('content-header')
    <h1>Payment Gateway<small>Configure your Transaksikita API settings.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Payment Gateway</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12 col-md-8">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Transaksikita Configuration</h3>
            </div>
            <form action="{{ route('admin.payment_gateway') }}" method="POST">
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-12">
                            <label class="control-label">Project ID</label>
                            <div>
                                <input type="text" class="form-control" name="project_id" value="{{ old('project_id', $project_id) }}" placeholder="TK84989" required />
                                <p class="text-muted small">Your Transaksikita Project ID.</p>
                            </div>
                        </div>
                        <div class="form-group col-md-12">
                            <label class="control-label">Public Key</label>
                            <div>
                                <input type="text" class="form-control" name="public_key" value="{{ old('public_key', $public_key) }}" placeholder="tk_live_..." required />
                                <p class="text-muted small">The public key for creating payments.</p>
                            </div>
                        </div>
                        <div class="form-group col-md-12">
                            <label class="control-label">Secret Key (Bearer Token)</label>
                            <div>
                                <input type="password" class="form-control" name="secret_key" value="{{ old('secret_key', $secret_key) }}" placeholder="sk_live_..." required />
                                <p class="text-muted small">The secret key used for Authorization headers and webhook signatures.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-primary pull-right">Save Configuration</button>
                    <button type="button" id="pingApiBtn" class="btn btn-info pull-left"><i class="fa fa-wifi"></i> Ping / Test Connection</button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="col-xs-12 col-md-4">
        <div class="box box-warning">
            <div class="box-header with-border">
                <h3 class="box-title">Information</h3>
            </div>
            <div class="box-body">
                <p>To enable automated top-ups, make sure your Webhook URL in Transaksikita is set to:</p>
                <code style="word-break: break-all;">{{ config('app.url') }}/api/webhooks/transaksikita</code>
                <p class="mt-4 text-muted small">When a user successfully pays via QRIS, the system will automatically receive the callback and activate the server.</p>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#pingApiBtn').on('click', function (e) {
            e.preventDefault();
            var btn = $(this);
            btn.addClass('disabled').html('<i class="fa fa-spinner fa-spin"></i> Pinging...');
            
            $.ajax({
                method: 'POST',
                url: '/admin/payment-gateway/ping',
                headers: { 'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content') }
            }).done(function (data) {
                swal({
                    type: 'success',
                    title: 'Success!',
                    text: data.message
                });
            }).fail(function (jqXHR) {
                var msg = 'An error occurred while pinging the API.';
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    msg = jqXHR.responseJSON.message;
                }
                swal({
                    type: 'error',
                    title: 'Connection Failed',
                    text: msg
                });
            }).always(function () {
                btn.removeClass('disabled').html('<i class="fa fa-wifi"></i> Ping / Test Connection');
            });
        });
    </script>
@endsection
